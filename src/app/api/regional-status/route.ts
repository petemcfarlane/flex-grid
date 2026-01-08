import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');

  try {
    if (postcode) {
      // Fetch regional data by postcode
      const response = await fetch(
        `https://api.carbonintensity.org.uk/regional/postcode/${encodeURIComponent(postcode)}`,
        {
          next: { revalidate: 30 },
          headers: { 'Accept': 'application/json' },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Fallback: fetch all regional data
    const response = await fetch(
      'https://api.carbonintensity.org.uk/regional',
      {
        next: { revalidate: 30 },
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Regional status API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regional data' },
      { status: 500 }
    );
  }
}
