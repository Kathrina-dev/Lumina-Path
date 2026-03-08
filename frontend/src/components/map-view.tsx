"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";

const position: LatLngExpression = [20.2376, 84.27];

export default function MapView() {
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
    </MapContainer>
  );
}