import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.carbonintensity.org.uk/intensity', {
      next: { revalidate: 30 }, // Cache for 30 seconds
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('API returned non-ok status:', response.status);
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Grid status API error:', error);
    // Return fallback data in the same structure as the real API
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
    });
  }
}
