'use client';

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { config } from '@/lib/config';
import { Asset } from '@/types/energy';

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  assets?: Asset[];
  showRegions?: boolean;
  regionalData?: any;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  center = [-0.1278, 51.5074], // London
  zoom = 10,
  assets = [],
  showRegions = false,
  regionalData = null,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const regionMarkersRef = useRef<mapboxgl.Marker[]>([]);

  // Approximate region centroids for label placement (using shortnames)
  const regionCentroids: Record<string, [number, number]> = {
    'North Scotland': [-4.0, 58.0],
    'South Scotland': [-3.5, 55.5],
    'North West England': [-2.3, 53.5],
    'North East England': [-1.8, 54.8],
    'Yorkshire': [-1.0, 54.0],
    'North Wales & Merseyside': [-3.0, 53.2],
    'South Wales': [-3.5, 51.6],
    'West Midlands': [-2.3, 52.4],
    'East Midlands': [-0.8, 53.1],
    'East England': [-0.5, 52.6],
    'South West England': [-3.5, 50.5],
    'South England': [-1.5, 51.1],
    'London': [-0.1, 51.5],
    'South East England': [0.3, 51.2],
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'ev':
        return '🔌';
      case 'heat_pump':
        return '🔥';
      case 'battery':
        return '🔋';
      case 'solar':
        return '☀️';
      default:
        return '⚡';
    }
  };

  const getAssetColor = (type: string) => {
    switch (type) {
      case 'ev':
        return '#3b82f6'; // Blue
      case 'heat_pump':
        return '#f97316'; // Orange
      case 'battery':
        return '#8b5cf6'; // Purple
      case 'solar':
        return '#eab308'; // Yellow
      default:
        return '#6b7280'; // Gray
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !config.mapbox.accessToken) {
      return;
    }

    mapboxgl.accessToken = config.mapbox.accessToken;

    // Clean up any existing map instance
    if (map.current) {
      try {
        map.current.remove();
      } catch (e) {
        // Ignore cleanup errors
      }
      map.current = null;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [center, zoom]);

  // Add markers for assets
  useEffect(() => {
    if (!map.current || !assets.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    assets.forEach((asset) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = getAssetIcon(asset.type);
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({
        element: el,
        color: getAssetColor(asset.type),
      })
        .setLngLat([asset.location.lng, asset.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, className: 'dark-popup' }).setHTML(`
            <div style="background-color: #1e293b; color: #ffffff; font-family: system-ui; padding: 12px; border-radius: 6px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${asset.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #cbd5e1;">${asset.type.replace('_', ' ')}</p>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1;">Status: ${asset.status}</p>
            </div>
          `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (assets.length > 0) {
      const bounds = assets.reduce(
        (bounds, asset) => {
          return bounds.extend([asset.location.lng, asset.location.lat]);
        },
        new mapboxgl.LngLatBounds(
          [assets[0].location.lng, assets[0].location.lat],
          [assets[0].location.lng, assets[0].location.lat]
        )
      );
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [assets]);

  // Add/remove region labels and update colors
  useEffect(() => {
    if (!map.current) return;

    // Clear existing region markers
    regionMarkersRef.current.forEach((marker) => marker.remove());
    regionMarkersRef.current = [];

    if (!showRegions || !regionalData) return;

    // Get regions from the nested structure
    const regions = regionalData.data?.[0]?.regions || [];

    // Create a map of region names to intensity data
    const areaNameMap: Record<string, string> = {
      'Scottish Hydro Electric Power Distribution': 'North Scotland',
      'SP Distribution': 'South and Central Scotland',
      'Electricity North West': 'North West England',
      'NPG North East': 'North East England',
      'NPG Yorkshire': 'Yorkshire',
      'SP Manweb': 'North Wales, Merseyside and Cheshire',
      'WPD South Wales': 'South Wales',
      'WPD West Midlands': 'West Midlands',
      'WPD East Midlands': 'East Midlands',
      'UKPN East': 'East England',
      'WPD South West': 'South West England',
      'SSE South': 'Southern England',
      'UKPN London': 'London',
      'UKPN South East': 'South East England',
    };

    const regionIntensityMap = new Map(
      regions
        .filter((region: any) => region.regionid <= 14)
        .map((region: any) => [
          areaNameMap[region.dnoregion] || region.dnoregion,
          {
            intensity: region.intensity?.index || 'moderate',
            carbon: region.intensity?.actual,
            shortname: region.shortname
          }
        ])
    );

    // Initialize regions layer on first use
    const initializeRegionLayers = async () => {
      if (!map.current) return;

      try {
        // Check if source already exists
        if (!map.current.getSource('region-boundaries')) {
          // Fetch the real GeoJSON boundaries from public folder
          const response = await fetch('/dno-regions.geojson');
          if (!response.ok) throw new Error('Failed to fetch GeoJSON');
          const geoJsonData = await response.json();
          
          // Transform GeoJSON to add top-level `id` field to each feature
          // This is required for Mapbox feature-state to work
          geoJsonData.features = geoJsonData.features.map((feature: any) => ({
            ...feature,
            id: feature.properties?.ID
          }));

          // Add source for region boundaries
          map.current.addSource('region-boundaries', {
            type: 'geojson',
            data: geoJsonData
          });

          // Add fill layer for regions FIRST (so it's below outlines)
          map.current.addLayer({
            id: 'region-fill',
            type: 'fill',
            source: 'region-boundaries',
            paint: {
              'fill-color': [
                'case',
                ['==', ['feature-state', 'intensity'], 'very low'],
                '#10b981',
                ['==', ['feature-state', 'intensity'], 'low'],
                '#6ee7b7',
                ['==', ['feature-state', 'intensity'], 'moderate'],
                '#64748b',
                ['==', ['feature-state', 'intensity'], 'high'],
                '#fb923c',
                ['==', ['feature-state', 'intensity'], 'very high'],
                '#f97316',
                '#64748b' // default
              ],
              'fill-opacity': 0.55
            }
          });

          // Add outline layer for regions
          map.current.addLayer({
            id: 'region-outline',
            type: 'line',
            source: 'region-boundaries',
            paint: {
              'line-color': [
                'case',
                ['==', ['feature-state', 'intensity'], 'very low'],
                '#059669',
                ['==', ['feature-state', 'intensity'], 'low'],
                '#10b981',
                ['==', ['feature-state', 'intensity'], 'moderate'],
                '#475569',
                ['==', ['feature-state', 'intensity'], 'high'],
                '#ea580c',
                ['==', ['feature-state', 'intensity'], 'very high'],
                '#c2410c',
                '#475569' // default
              ],
              'line-width': 2.5,
              'line-opacity': 0.8
            }
          });

          console.log('Region layers added successfully');
        }

        // Now update feature states
        updateRegionStates();
      } catch (error) {
        console.error('Failed to initialize region layers:', error);
      }
    };

    // Update feature state for all features in the GeoJSON
    const updateRegionStates = () => {
      if (!map.current) return;
      
      const source = map.current.getSource('region-boundaries');
      if (!source) {
        console.warn('region-boundaries source still not found');
        return;
      }

      const data = (source as any)._data;
      
      if (data && data.features) {
        data.features.forEach((feature: any) => {
          const areaName = feature.properties?.Area || '';
          const intensityData = regionIntensityMap.get(areaName);
          const featureId = feature.id;
          
          if (intensityData && featureId !== undefined) {
            map.current!.setFeatureState(
              { source: 'region-boundaries', id: featureId },
              { intensity: intensityData.intensity } as Record<string, any>
            );
          }
        });
      }
    };

    // Initialize layers and add region labels
    initializeRegionLayers();

    // Add region labels at centroids
    regions.forEach((region: any) => {
      if (region.regionid > 14) return;

      const coords = regionCentroids[region.shortname] || [-2, 54];
      const intensity = region.intensity?.index || 'moderate';
      const isLow = intensity === 'low' || intensity === 'very low';
      const isHigh = intensity === 'high' || intensity === 'very high';

      const el = document.createElement('div');
      el.className = 'region-label';
      el.innerHTML = `<div style="
        background: ${isLow ? 'rgb(16, 185, 129)' : isHigh ? 'rgb(249, 115, 22)' : 'rgb(100, 116, 139)'};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        max-width: 60px;
        white-space: normal;
      ">${region.shortname}</div>`;
      el.style.cursor = 'default';

      const marker = new mapboxgl.Marker({
        element: el,
      })
        .setLngLat(coords as [number, number])
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div style="background-color: #1e293b; color: #ffffff; font-family: system-ui; padding: 8px;">
              <h4 style="margin: 0 0 4px 0; font-size: 13px;">${region.shortname}</h4>
              <p style="margin: 0; font-size: 12px;">${region.intensity?.actual || '—'} gCO₂/kWh</p>
            </div>
          `)
        )
        .addTo(map.current!);

      regionMarkersRef.current.push(marker);
    });
  }, [showRegions, regionalData, regionCentroids]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
};
