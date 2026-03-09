"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { LatLngExpression, DivIcon } from "leaflet";
import { MapPin } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

const position: LatLngExpression = [20.2376, 84.27];

// create a custom icon using lucide-react MapPin svg

const pinSvg = ReactDOMServer.renderToStaticMarkup(<MapPin size={24} color="#FF1A6C" />);
const pinIcon = new DivIcon({
  html: pinSvg,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

interface PointInfo {
  lat: number;
  lon: number;
  crowdScore?: number;
  lightingScore?: number;
}

interface MapViewProps {
  activeLayers: Record<string, boolean>;
  /** invoked when new crowd/lighting data is fetched */
  onScores?: (scores: { crowdScore?: number; lightingScore?: number }) => void;
}

export default function MapView({ activeLayers, onScores }: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [points, setPoints] = useState<PointInfo[]>([]);
  const [lastClick, setLastClick] = useState<{lat:number; lon:number} | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // helper to fetch scores for a clicked location
  const fetchScores = async (lat: number, lon: number) => {
    setLastClick({ lat, lon });
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || ""; // allow proxy
    const newPoint: PointInfo = { lat, lon };

    if (activeLayers.crowd) {
      try {
        const res = await fetch(`${base}/crowd?lat=${lat}&lon=${lon}`);
        const json = await res.json();
        newPoint.crowdScore = json.crowdScore;
      } catch (err) {
        console.warn("failed to fetch crowd score", err);
      }
    }

    if (activeLayers.lighting) {
      try {
        const res = await fetch(`${base}/lighting?lat=${lat}&lon=${lon}`);
        const json = await res.json();
        newPoint.lightingScore = json.lightingScore;
      } catch (err) {
        console.warn("failed to fetch lighting score", err);
      }
    }

    setPoints((prev) => [...prev, newPoint]);

    if (onScores) {
      onScores({
        crowdScore: newPoint.crowdScore,
        lightingScore: newPoint.lightingScore,
      });
    }
  };

  function ClickHandler() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        fetchScores(lat, lng);
      },
    });
    return null;
  }

  if (!mounted) return null;
  return (
    <MapContainer
      center={position}
      zoom={7.3}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler />

      {lastClick && (
        <Marker position={[lastClick.lat, lastClick.lon]} icon={pinIcon}> {/* persistent pin */}
          <Popup>Location</Popup>
        </Marker>
      )}

      {points.map((p, idx) => {
        // decide whether to render this marker depending on active layers
        const showCrowd = activeLayers.crowd && p.crowdScore !== undefined;
        const showLight = activeLayers.lighting && p.lightingScore !== undefined;
        if (!showCrowd && !showLight) return null;
        return (
          <Marker key={idx} position={[p.lat, p.lon]} icon={pinIcon}>
            <Popup>
              <div style={{ fontSize: "0.85rem" }}>
                {showCrowd && <div>Crowd: {p.crowdScore!.toFixed(2)}</div>}
                {showLight && <div>Lighting: {p.lightingScore!.toFixed(2)}</div>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}