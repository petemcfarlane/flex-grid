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
      throw new Error(`API responded with ${response.status}`);
    }

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('API did not return JSON');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Grid status API error:', error);
    // Return fallback data
    return NextResponse.json({
      data: {
        intensity: { actual: 150 },
        generationmix: [],
      },
    });
  }
}
