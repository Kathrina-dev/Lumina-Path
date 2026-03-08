"use client";

import dynamic from "next/dynamic";
import SearchPanel from "./search-panel";
import RouteControls from "./route-controls";
import LayerToggle from "./layer-toggle";
import RouteInfoPanel from "./route-info-panel";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="h-screen w-screen relative">

      <MapView />

      <SearchPanel />

      <RouteControls />

      <LayerToggle />

      <RouteInfoPanel />

    </div>
  );
}