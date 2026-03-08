"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import SearchPanel from "./search-panel";
import RouteControls from "./route-controls";
import LayerToggle from "./layer-toggle";
import RouteInfoPanel from "./route-info-panel";

const MapView = dynamic(() => import("./map-view"), { ssr: false });

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mobile bottom sheet state
  const [activeTab, setActiveTab] = useState<"search" | "route" | "layers" | "info">("search");
  const [sheetOpen, setSheetOpen] = useState(true);

  const mobileTabs = [
    {
      key: "search" as const, label: "Route",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2"/><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>,
    },
    {
      key: "route" as const, label: "Prefer",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>,
    },
    {
      key: "layers" as const, label: "Layers",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
      key: "info" as const, label: "Info",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>,
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
          background: white; /* ensure collapsed area stays white */
        }

        /* The collapse toggle tab on the left edge of sidebar */
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
          transition: background 0.15s;
        }
        .lp-sidebar-toggle:hover { background: #fff0f5; }

        /* The scrollable panel column */
        .lp-sidebar-panels {
          pointer-events: auto;
          width: 250px;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 14px 14px 20px 10px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(255,255,255,0.0);
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
          transform: translateX(100%); /* slide completely offscreen */
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
            border-bottom: 1.5px solid #f3f3f3;
            padding: 0 12px;
          }
          .lp-tab {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; gap: 3px;
            padding: 7px 4px 9px;
            background: none; border: none;
            border-bottom: 2.5px solid transparent;
            cursor: pointer; font-family: inherit;
            font-size: 0.58rem; font-weight: 800;
            letter-spacing: 0.05em; text-transform: uppercase;
            color: #bbb; transition: color 0.15s, border-color 0.15s;
          }
          .lp-tab.active { color: #FF1A6C; border-bottom-color: #FF1A6C; }
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
        <MapView />
      </div>

      {/* ── Header ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 25,
        padding: "11px 16px 9px",
        background: "white",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "11px", flexShrink: 0,
            background: "linear-gradient(145deg, #FF6BA8, #FF1A6C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(255,26,108,0.35)",
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
              <circle cx="12" cy="9" r="2.6" fill="rgba(255,26,108,0.5)"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.98rem", color: "#1a1a1a", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Lumina Path
            </div>
            <div className="lp-header-sub" style={{ fontSize: "0.6rem", color: "#FF1A6C", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Safe Night Navigation
            </div>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
          borderRadius: "20px", padding: "5px 13px 5px 7px",
          boxShadow: "0 3px 12px rgba(255,26,108,0.3)",
        }}>
          <div style={{ width: "25px", height: "25px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#FF1A6C"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#FF6BA8"/>
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: "800", fontSize: "0.8rem" }}>You</span>
        </div>
      </div>

      {/* ── Desktop: Search panel top-left ── */}
      <div className="lp-desktop-search" style={{ position: "absolute", top: "72px", left: "14px", zIndex: 20 }}>
        <SearchPanel />
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
          <RouteControls />
          <LayerToggle />
          <RouteInfoPanel />
        </div>
      </div>

      {/* ── Mobile: bottom sheet ── */}
      <div className={`lp-mobile-sheet${sheetOpen ? "" : " collapsed"}`}>
        <div className="lp-sheet-handle-row" onClick={() => setSheetOpen((p) => !p)}>
          <div className="lp-sheet-handle" />
        </div>
        <div className="lp-tab-bar">
          {mobileTabs.map((t) => (
            <button
              key={t.key}
              className={`lp-tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => { setActiveTab(t.key); setSheetOpen(true); }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        <div className="lp-sheet-content">
          {activeTab === "search"  && <SearchPanel />}
          {activeTab === "route"   && <RouteControls />}
          {activeTab === "layers"  && <LayerToggle />}
          {activeTab === "info"    && <RouteInfoPanel />}
        </div>
      </div>
    </div>
  );
}