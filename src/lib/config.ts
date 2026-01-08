/**
 * Environment and app configuration
 */
export const config = {
  mapbox: {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  },
  api: {
    carbonIntensity: 'https://api.carbonintensity.org',
  },
};
