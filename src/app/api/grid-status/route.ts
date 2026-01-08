import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [intensityResponse, generationResponse] = await Promise.all([
      fetch('https://api.carbonintensity.org.uk/intensity', {
        next: { revalidate: 30 }, // Cache for 30 seconds
        headers: { 'Accept': 'application/json' },
      }),
      fetch('https://api.carbonintensity.org.uk/generation', {
        next: { revalidate: 30 },
        headers: { 'Accept': 'application/json' },
      }),
    ]);

    if (!intensityResponse.ok) {
      throw new Error(`Intensity API responded with ${intensityResponse.status}`);
    }

    const intensityData = await intensityResponse.json();
    const generationData = generationResponse.ok ? await generationResponse.json() : null;
    
    // Combine the responses
    const response = {
      ...intensityData,
      generation: generationData?.data,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Grid status API error:', error);
    // Return fallback data
    return NextResponse.json({
      data: [
        {
          from: new Date().toISOString(),
          to: new Date(Date.now() + 30 * 60000).toISOString(),
          intensity: { 
            actual: 150,
            forecast: 150,
            index: 'low',
          },
        },
      ],
      generation: {
        generationmix: [
          { fuel: 'wind', perc: 30 },
          { fuel: 'gas', perc: 25 },
          { fuel: 'nuclear', perc: 20 },
          { fuel: 'coal', perc: 5 },
          { fuel: 'biomass', perc: 10 },
          { fuel: 'hydro', perc: 5 },
          { fuel: 'solar', perc: 5 },
        ],
      },
    });
  }
}
