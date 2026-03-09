"use client";

import { useEffect, useState } from "react";

// helper converts GeoJSON-style [lng, lat] arrays into Leaflet-friendly [lat, lng]
function convertToLatLng(coords: number[][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng] as [number, number]);
}

// component responsible for fitting map bounds once when routes are provided
// receives an optional `trigger` token - when it changes the component
// will allow the effect to run again even if `routes` didn't change.
function FitBounds({ routes, trigger }: { routes: any[]; trigger?: number }) {
  const map = useMap();
  const fittedRef = useState(false); // use state to trigger rerender if needed
  const [fitted, setFitted] = fittedRef;

  // reset fitted when trigger changes
  useEffect(() => {
    setFitted(false);
  }, [trigger]);

  useEffect(() => {
    if (!routes?.length || fitted) return;

    const allCoords: [number, number][] = [];
    routes.forEach((r) => {
      if (r?.geometry?.coordinates) {
        const coords = r.geometry.coordinates as [number, number][];
        allCoords.push(...convertToLatLng(coords));
      }
    });

    if (allCoords.length) {
      map.fitBounds(allCoords);
      setFitted(true);
    }
  }, [routes, map, fitted]);

  return null;
}
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  CircleMarker,
  useMap
} from "react-leaflet";
import L, { LatLngExpression, LeafletMouseEvent } from "leaflet";
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

const defaultPosition: LatLngExpression = [20.2376, 84.27];
// kept in sync with RouteControls and Home logic
// order here no longer important; using map below instead
//  fastest   -> blue
//  safest    -> green
//  balanced  -> orange
const routeColorMap: Record<string, string> = {
  fastest: "#2979FF",
  safest: "#00C853",
  balanced: "#FF6D00",
};

interface PointInfo {
  lat: number;
  lon: number;
  crowdScore?: number;
  lightingScore?: number;
}

interface MapViewProps {
  activeLayers: Record<string, boolean>;
  onScores?: (scores: { crowdScore?: number; lightingScore?: number }) => void;
  onLocation?: (loc: { lat: number; lon: number }) => void;
  startLocation?: { lat: number; lon: number } | null;
  destination?: { lat: number; lon: number } | null;
  // each route may include a `type` field added by Home ("fastest"|"safest"|"balanced")
  routes?: Array<any>;
  fitTrigger?: number;
}

export default function MapView({
  activeLayers,
  onScores,
  onLocation,
  startLocation,
  destination,
  routes = [],
  fitTrigger,
}: MapViewProps) {
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

  const fetchScores = async (lat: number, lon: number) => {
    setLastClick({ lat, lon });
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
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
      click: (e: LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        fetchScores(lat, lng);
      },
    });
    return null;
  }

  if (!mounted) return null;

  return (
    <MapContainer
      center={defaultPosition}
      zoom={7.3}
      style={{ height: "100vh", width: "100vw" }}
      scrollWheelZoom={true}
      dragging={true}
      doubleClickZoom={true}
      touchZoom={true}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds routes={routes} trigger={fitTrigger} />
      <ClickHandler />

      {/* User clicked location */}
      {lastClick && (
        <Marker position={[lastClick.lat, lastClick.lon]} icon={pinIcon}>
          <Popup>Your location</Popup>
        </Marker>
      )}

      {/* Start / destination */}
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

      {/* User current location */}
      {userLocation && (
        <Marker position={userLocation} icon={pinIcon}>
          <Popup>Your location</Popup>
        </Marker>
      )}

      {/* Routes */}
      {routes?.map((route: any, i: number) => {
        if (!route?.geometry?.coordinates) return null;

        const coords: [number, number][] = convertToLatLng(route.geometry.coordinates);
        const offset = i * 0.00005; // ~5 meters
        const offsetCoords = coords.map(([lat, lng]) => [lat + offset, lng + offset] as [number, number]);

        const color = routeColorMap[route.type] || "#888";
        return (
          <Polyline
            key={`route-${i}`}
            positions={offsetCoords}
            pathOptions={{
              color,
              weight: 6,
              opacity: 0.9,
            }}
          />
        );
      })}

      {/* Risk zones */}
      {routes?.map((route: any) =>
        route?.safety?.riskZones?.map((zone: { coordinates: [number, number] }, i: number) => {
          const [lng, lat] = zone.coordinates;
          return (
            <CircleMarker
              key={`risk-${i}`}
              center={[lat, lng]}
              radius={8}
              pathOptions={{
                color: "#FF1A1A",
                fillColor: "#FF1A1A",
                fillOpacity: 0.9,
              }}
            />
          );
        })
      )}

      {/* Clicked points */}
      {points.map((p, idx) => {
        const showCrowd = activeLayers.crowd && p.crowdScore !== undefined;
        const showLight = activeLayers.lighting && p.lightingScore !== undefined;
        if (!showCrowd && !showLight) return null;

        return (
          <Marker key={`point-${idx}`} position={[p.lat, p.lon]} icon={pinIcon}>
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