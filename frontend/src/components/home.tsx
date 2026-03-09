"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import SearchPanel from "./search-panel";
import RouteControls from "./route-controls";
import LayerToggle from "./layer-toggle";
import RouteInfoPanel from "./route-info-panel";
import SOSBlock from "./sos";
import SafetyReportBlock from "./safety-report";

const MapView = dynamic(() => import("./map-view"), { ssr: false });

type TabKey = "search" | "route" | "layers" | "info" | "sos" | "report";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // routing-related state
  const [userLocation, setUserLocation] = useState<{lat:number;lon:number} | null>(null);
  const [destination, setDestination] = useState<{lat:number;lon:number} | null>(null);
  const [pendingDestination, setPendingDestination] = useState<{lat:number;lon:number} | null>(null);
  // keep the full array of routes with type metadata
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [routeScores, setRouteScores] = useState<any[]>([]);
  const [routePref, setRoutePref] = useState<"all"|"safest"|"balanced"|"fastest">("all");
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const lastRoute = useRef<string | null>(null);
  const [latestScores, setLatestScores] = useState<{crowdScore?: number; lightingScore?: number}>({});
  const fetchingRoute = useRef(false);
  // loadingRoute unused; remove state
  // active map layers (lighting, stores, reports etc.)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    lighting: true,
    crowd: true,
    stores: false,
    reports: false,
  });

  // handle safe-route querying
  const fetchSafeRoute = useCallback(async (
    start: { lat: number; lon: number },
    dest: { lat: number; lon: number }
  ) => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || 5000;

    try {
      const res = await fetch(`${base}/api/safe-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end: dest }),
      });

      const json = await res.json();

      if (json.routes) {
        // annotate each route with its key so we can filter later
        const arr: any[] = [];
        if (json.routes.fastest) arr.push({ ...json.routes.fastest, type: "fastest" });
        if (json.routes.safest) arr.push({ ...json.routes.safest, type: "safest" });
        if (json.routes.balanced) arr.push({ ...json.routes.balanced, type: "balanced" });

        setAllRoutes(arr);

        const scores = arr.map((r: any) => r.safety || {});
        setRouteScores(scores);
      }
    } catch (err) {
      console.error("failed to fetch safe route", err);
    }
  }, []);

  // called by SearchPanel when the user hits the button
  const handleSearch = (dest: { lat: number; lon: number }) => {
    setDestination(dest);
    setPendingDestination(dest);
  };

  // trigger route request only when user explicitly searches
  useEffect(() => {
    if (!userLocation || !pendingDestination) return;

    const key = `${userLocation.lat},${userLocation.lon}-${pendingDestination.lat},${pendingDestination.lon}`;
    if (lastRoute.current === key) return;
    lastRoute.current = key;

    if (fetchingRoute.current) return;
    fetchingRoute.current = true;

    fetchSafeRoute(userLocation, pendingDestination)
      .finally(() => {
        fetchingRoute.current = false;
        setShowAllRoutes(true);
        setPendingDestination(null);
      });
  }, [userLocation, pendingDestination, fetchSafeRoute]);

  // Mobile bottom sheet state
  const [activeTab, setActiveTab] = useState<TabKey>("search");
  // bottom sheet starts collapsed on mobile
  const [sheetOpen, setSheetOpen] = useState(false);

  // drag/swipe support for mobile sheet
  const dragRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const sheet = dragRef.current;
    if (!sheet) return;

    const handleTouchStart = (e: TouchEvent) => {
      setDragging(true);
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const deltaY = e.touches[0].clientY - startYRef.current;
      currentYRef.current = deltaY;
      // move sheet visually
      sheet.style.transform = `translateY(${Math.max(0, deltaY)}px)`;
    };

    const handleTouchEnd = () => {
      setDragging(false);
      const threshold = 80; // swipe threshold to collapse
      if (currentYRef.current > threshold) {
        setSheetOpen(false); // collapse
      } else {
        setSheetOpen(true); // revert to expanded
      }
      sheet.style.transform = ""; // reset transform
      currentYRef.current = 0;
    };

    sheet.addEventListener("touchstart", handleTouchStart);
    sheet.addEventListener("touchmove", handleTouchMove);
    sheet.addEventListener("touchend", handleTouchEnd);
    sheet.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      sheet.removeEventListener("touchstart", handleTouchStart);
      sheet.removeEventListener("touchmove", handleTouchMove);
      sheet.removeEventListener("touchend", handleTouchEnd);
      sheet.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [dragging]);

  const mobileTabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: "search", label: "Route",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2"/><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>,
    },
    {
      key: "route", label: "Prefer",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>,
    },
    {
      key: "layers", label: "Layers",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
      key: "info", label: "Info",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>,
    },
    {
      key: "sos", label: "SOS",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1 .37 1.98.72 2.91a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.93.35 1.9.59 2.91.72A2 2 0 0122 16.92z" fill="currentColor"/></svg>,
    },
    {
      key: "report", label: "Report",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
  ];

  return (
    <div
      className="h-screen w-screen relative overflow-hidden bg-white"
      style={{ fontFamily: "'Nunito', 'Helvetica Neue', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&display=swap');

        /* ─── Mobile bottom sheet (hidden on desktop) ─── */
        .lp-mobile-sheet { display: none; }
        .lp-desktop-search { display: block; }
        .lp-desktop-sidebar { display: flex; }

        /* ─── Right sidebar ─── */
        .lp-sidebar {
          position: absolute;
          top: 62px;
          right: 0;
          bottom: 0;
          z-index: 20;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          pointer-events: none;
          background: transparent;
          transition: background 0.50s ease;  
        }

        .lp-sidebar-toggle {
          pointer-events: auto;
          align-self: center;
          background: white;
          border: none;
          border-radius: 12px 0 0 12px;
          width: 40px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: -3px 0 12px rgba(0,0,0,0.08);
          color: #FF1A6C;
          flex-shrink: 0;
          transition: background 0.50s ease;
        }
        .lp-sidebar-toggle:hover { background: #fff0f5; }

        .lp-sidebar-panels {
            pointer-events: auto;
            width: 250px;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 14px 14px 20px 10px;
            border-radius: 24px 24px 0 0;
            display: flex;
            flex-direction: column;
            gap: 12px;

            /* Glass effect */
            background: rgba(255, 255, 255, 0.45);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-left: 1px solid rgba(255,255,255,0.35);
            box-shadow: -6px 0 22px rgba(0,0,0,0.08);
            transition: width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s, padding 0.3s;
            scrollbar-width: none;
        }
        .lp-sidebar-panels::-webkit-scrollbar { display: none; }
        .lp-sidebar-panels.closed {
          width: 0;
          opacity: 0;
          padding-left: 0;
          padding-right: 0;
          pointer-events: none;
          transform: translateX(100%);
        }

        /* ─── Mobile ─── */
        @media (max-width: 768px) {
          .lp-desktop-search { display: none; }
          .lp-sidebar { display: none; }

          .lp-mobile-sheet {
            display: block;
            position: absolute;
            bottom: 0; left: 0; right: 0;
            z-index: 30;
            background: white;
            border-radius: 24px 24px 0 0;
            box-shadow: 0 -4px 30px rgba(0,0,0,0.13);
            transition: transform 0.32s cubic-bezier(0.34, 1.1, 0.64, 1);
            max-height: 74vh;
          }
          .lp-mobile-sheet.collapsed {
            transform: translateY(calc(100% - 60px));
          }
          .lp-sheet-handle-row {
            display: flex; justify-content: center;
            padding: 10px 0 6px; cursor: pointer;
          }
          .lp-sheet-handle {
            width: 36px; height: 4px;
            background: #e5e7eb; border-radius: 2px;
          }
          .lp-tab-bar {
            display: flex;
            justify-content: space-between;
            border-bottom: 1.5px solid #f3f3f3;
            padding: 0 8px;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .lp-tab-bar::-webkit-scrollbar { display: none; }
          .lp-tab {
            flex-shrink: 0;
            display: flex; flex-direction: column;
            align-items: center; gap: 3px;
            padding: 7px 10px 9px;
            background: none; border: none;
            border-bottom: 2.5px solid transparent;
            cursor: pointer; font-family: inherit;
            font-size: 0.58rem; font-weight: 800;
            letter-spacing: 0.05em; text-transform: uppercase;
            color: #bbb; transition: color 0.15s, border-color 0.15s;
            white-space: nowrap;
          }
          .lp-tab.active { color: #FF1A6C; border-bottom-color: #FF1A6C; }
          /* SOS tab always tinted red even when inactive */
          .lp-tab.sos-tab { color: #FF1A6C; opacity: 0.6; }
          .lp-tab.sos-tab.active { opacity: 1; }
          .lp-sheet-content {
            padding: 14px 14px 32px;
            overflow-y: auto;
            max-height: calc(74vh - 95px);
          }
          .lp-sheet-content > div,
          .lp-sheet-content > div > div {
            width: 100% !important; max-width: 100% !important;
            box-sizing: border-box;
          }
        }

        @media (max-width: 420px) {
          .lp-header-sub { display: none; }
        }
      `}</style>

      {/* map occupies full screen behind everything else */}
      <div className="lp-map-bg" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <MapView
          activeLayers={activeLayers}
          onScores={setLatestScores}
          onLocation={(loc) => setUserLocation(loc)}
          startLocation={userLocation}
          destination={destination}
          routes={
            showAllRoutes
              ? allRoutes
              : allRoutes.filter((r) => r.type === routePref)
          }
        />
      </div>

      {/* ── Header ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 25,
        padding: "11px 16px 9px",
        background: "white",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "11px",
              flexShrink: 0,
              background: "linear-gradient(145deg, #FF6BA8, #FF1A6C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(255,26,108,0.35)",
              overflow: "hidden"
            }}
          >
            <img
              src="/lumina-logo.png"
              alt="Lumina Logo"
              style={{
                width: "20px",
                height: "20px",
                objectFit: "contain"
              }}
            />
          </div>

          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "0.98rem",
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Lumina Path
            </div>

            <div
              className="lp-header-sub"
              style={{
                fontSize: "0.6rem",
                color: "#FF1A6C",
                fontWeight: "700",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Safe Night Navigation
            </div>
          </div>
        </div>

        {/* Header right: SOS quick-pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* SOS chip */}
            <div
            onClick={() => { setActiveTab("sos"); setSheetOpen(true); }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
                borderRadius: "20px",
                padding: "5px 13px 5px 7px",
                boxShadow: "0 3px 12px rgba(255,26,108,0.3)",
                cursor: "pointer",
            }}
            >
                <div
                    style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1 .37 1.98.72 2.91a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.93.35 1.9.59 2.91.72A2 2 0 0122 16.92z" fill="#FF1A6C"/>
                    </svg>
                </div>

                <span style={{ color: "white", fontWeight: "800", fontSize: "0.8rem" }}>
                    SOS
                </span>
                </div>
            </div>
      </div>

      {/* ── Desktop: Search panel top-left ── */}
      <div className="lp-desktop-search" style={{ position: "absolute", top: "72px", left: "14px", zIndex: 20 }}>
        <SearchPanel userLocation={userLocation} onSearch={handleSearch} />
      </div>

      {/* ── Desktop: Right collapsible sidebar ── */}
      <div className="lp-sidebar">
        {/* Collapse toggle tab */}
        <button
          className="lp-sidebar-toggle"
          onClick={() => setSidebarOpen((p) => !p)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            width="25" height="25" viewBox="0 0 24 24" fill="none"
            style={{ transform: sidebarOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
          >
            <path d="M15 6l-6 6 6 6" stroke="#FF1A6C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Panels column */}
        <div className={`lp-sidebar-panels${sidebarOpen ? "" : " closed"}`}>
          <RouteControls
            selected={routePref === "all" ? undefined : (routePref as any)}
            onChange={(key) => {
              setRoutePref(key);
              setShowAllRoutes(false);
            }}
          />
          <LayerToggle initialState={activeLayers} onChange={setActiveLayers} />
          <RouteInfoPanel
            crowdScore={latestScores.crowdScore}
            lightingScore={latestScores.lightingScore}
            routeScore={
              showAllRoutes
                ? undefined
                : routeScores[
                    allRoutes.findIndex((r) => r.type === routePref)
                  ]
            }
          />
          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,26,108,0.12)", margin: "2px 0" }} />
          <SOSBlock />
          <SafetyReportBlock />
        </div>
      </div>

      {/* ── Mobile: bottom sheet ── */}
      <div ref={dragRef} className={`lp-mobile-sheet${sheetOpen ? "" : " collapsed"}`}>
        <div className="lp-sheet-handle-row" onClick={() => setSheetOpen((p) => !p)}>
          <div className="lp-sheet-handle" />
        </div>
        <div className="lp-tab-bar">
          {mobileTabs.map((t) => (
            <button
              key={t.key}
              className={`lp-tab${activeTab === t.key ? " active" : ""}${t.key === "sos" ? " sos-tab" : ""}`}
              onClick={() => {
                setActiveTab(t.key);
                // always open sheet when a tab is chosen
                setSheetOpen(true);
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        <div className="lp-sheet-content">
          {activeTab === "search" && <SearchPanel userLocation={userLocation} onSearch={handleSearch} />}
          {activeTab === "route"  && (
            <RouteControls
              selected={routePref === "all" ? undefined : (routePref as any)}
              onChange={(key) => {
                setRoutePref(key);
                setShowAllRoutes(false);
              }}
            />
          )}
          {activeTab === "layers" && <LayerToggle />}
          {activeTab === "info"   && <RouteInfoPanel />}
          {activeTab === "sos"    && <SOSBlock />}
          {activeTab === "report" && <SafetyReportBlock />}
        </div>
      </div>
    </div>
  );
}