"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { MapPin } from "lucide-react";
import ReactDOMServer from "react-dom/server";

// simple pink pin using lucide icon rendered to HTML string
const pinIcon = L.divIcon({
  className: "", // no extra wrapper styling
  html: ReactDOMServer.renderToString(
    <MapPin strokeWidth={1.5} size={30} color="#FF1A6C" />
  ),
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

const position: LatLngExpression = [20.2376, 84.27];

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
  /** notified when geolocation is obtained */
  onLocation?: (loc: { lat: number; lon: number }) => void;
  startLocation?: { lat: number; lon: number } | null;
  destination?: { lat: number; lon: number } | null;
  routes?: Array<any>;
}

export default function MapView({ activeLayers, onScores, onLocation, startLocation, destination, routes = [] }: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [points, setPoints] = useState<PointInfo[]>([]);
  const [lastClick, setLastClick] = useState<{ lat: number; lon: number } | null>(null);
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    setMounted(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation([loc.lat, loc.lon]);
          onLocation?.(loc);
        },
        (err) => console.warn("geolocation failed", err),
        { enableHighAccuracy: true }
      );
    }
  }, [onLocation]);

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
          <Popup>Your location</Popup>
        </Marker>
      )}
      {startLocation && (
        <Marker position={[startLocation.lat, startLocation.lon]} icon={pinIcon}>
          <Popup>Start</Popup>
        </Marker>
      )}
      {destination && (
        <Marker position={[destination.lat, destination.lon]} icon={pinIcon}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {/* show routes */}
      {routes.map((route, idx) => {
        const coords: [number, number][] = route.geometry.coordinates.map(
          ([lon, lat]: [number, number]) => [lat, lon]
        );
        const colors = ["#3b82f6", "#10b981", "#f59e0b"];
        return (
          <Polyline key={idx} positions={coords} pathOptions={{ color: colors[idx] || "#888", weight: 5 }} />
        );
      })}

      {userLocation && (
        <Marker position={userLocation} icon={pinIcon}>
          <Popup>Your location</Popup>
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