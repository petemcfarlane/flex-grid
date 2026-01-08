import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get date range: yesterday through tomorrow for a full rolling window
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const productsResponse = await fetch(
      'https://api.octopus.energy/v1/products/?is_variable=true&page_size=100',
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const productsData = await productsResponse.json();
    
    // Find the Agile product (look for one that contains "Agile" in the name)
    const agileProductSummary = productsData.results?.find(
      (p: any) => p.display_name?.includes('Agile') || p.full_name?.includes('Agile')
    );

    if (!agileProductSummary) {
      throw new Error('Agile product not found');
    }

    const productCode = agileProductSummary.code;

    // Fetch the FULL product details (which includes tariff information)
    const fullProductResponse = await fetch(
      `https://api.octopus.energy/v1/products/${productCode}/`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!fullProductResponse.ok) {
      throw new Error('Failed to fetch full product details');
    }

    const agileProduct = await fullProductResponse.json();

    // Get the tariff code for this product
    // Try single register first, then dual register
    // The structure is: tariffs[gsp][paymentType][code] (e.g., tariffs._A.direct_debit_monthly.code)
    let tariffCode: string | undefined;
    
    if (agileProduct.single_register_electricity_tariffs) {
      const tariffs = agileProduct.single_register_electricity_tariffs;
      for (const gsp in tariffs) {
        const gspData = tariffs[gsp];
        // Try to find code in any payment type
        for (const paymentType in gspData) {
          if (gspData[paymentType]?.code) {
            tariffCode = gspData[paymentType].code;
            break;
          }
        }
        if (tariffCode) break;
      }
    }

    if (!tariffCode && agileProduct.dual_register_electricity_tariffs) {
      const tariffs = agileProduct.dual_register_electricity_tariffs;
      for (const gsp in tariffs) {
        const gspData = tariffs[gsp];
        for (const paymentType in gspData) {
          if (gspData[paymentType]?.code) {
            tariffCode = gspData[paymentType].code;
            break;
          }
        }
        if (tariffCode) break;
      }
    }

    if (!tariffCode) {
      throw new Error('Tariff code not found in product structure');
    }

    // Fetch rates from yesterday through tomorrow for rolling window
    const ratesUrl = `https://api.octopus.energy/v1/products/${productCode}/electricity-tariffs/${tariffCode}/standard-unit-rates/?period_from=${yesterdayStr}T00:00:00Z&period_to=${tomorrowStr}T23:59:59Z&page_size=200`;

    const ratesResponse = await fetch(ratesUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes since rates change
    });

    if (!ratesResponse.ok) {
      throw new Error(`Failed to fetch rates: ${ratesResponse.status}`);
    }

    const ratesData = await ratesResponse.json();

    // Transform the API response to match our settlement period format
    // Sort by valid_from (newest first) and reverse to get chronological order
    const sortedResults = (ratesData.results || []).sort(
      (a: any, b: any) => new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime()
    );

    const periods = sortedResults.map((rate: any) => {
        const validFrom = new Date(rate.valid_from);
        const hour = validFrom.getUTCHours();
        const minute = validFrom.getUTCMinutes();
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        // Octopus returns prices in pence per kWh as decimal (e.g., 25.5)
        const priceInPence = parseFloat(rate.value_inc_vat) || 0;

        return {
          period: validFrom.getTime(), // Use timestamp as unique identifier
          time,
          timestamp: validFrom.toISOString(),
          cost: Math.round(priceInPence * 100) / 100, // Ensure 2 decimal places
        };
      });

    return NextResponse.json({
      periods,
      productCode,
      tariffCode,
    });
  } catch (error) {
    console.error('Tariff rates API error:', error);
    // Return empty array - will trigger fallback in hook
    return NextResponse.json({
      periods: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
