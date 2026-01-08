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
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  center = [-0.1278, 51.5074], // London
  zoom = 10,
  assets = [],
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
};
