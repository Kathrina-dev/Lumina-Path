"use client";
import { useState } from "react";

const layers = [
  { key: "lighting", label: "Street Lighting", emoji: "💡", defaultOn: true },
  { key: "crowd",    label: "Crowd Density",    emoji: "👥", defaultOn: true },
  { key: "stores",   label: "Open Stores",     emoji: "🏪", defaultOn: false },
  { key: "reports",  label: "Safety Reports",  emoji: "🛡️", defaultOn: false },
];

interface LayerToggleProps {
  /** called whenever the active layer map changes */
  onChange?: (active: Record<string, boolean>) => void;
  /** initial state, defaults to `layers[].defaultOn` */
  initialState?: Record<string, boolean>;
}

export default function LayerToggle({ onChange, initialState }: LayerToggleProps) {
  const [active, setActive] = useState<Record<string, boolean>>(
    initialState ?? Object.fromEntries(layers.map((l) => [l.key, l.defaultOn]))
  );

  const toggle = (key: string) => {
    const next = { ...active, [key]: !active[key] };
    setActive(next);
    onChange?.(next);
  };

  return (
    <div style={{
      background: "white", borderRadius: "20px",
      padding: "14px 14px",
      width: "100%", boxSizing: "border-box",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
    }}>
      <div style={{ fontSize: "0.62rem", color: "#FF1A6C", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
        Map Layers
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {layers.map((layer) => {
          const on = active[layer.key];
          return (
            <div
              key={layer.key}
              onClick={() => toggle(layer.key)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 12px", borderRadius: "13px",
                background: on ? "rgba(255,26,108,0.07)" : "#f9f9f9",
                border: `1.5px solid ${on ? "rgba(255,26,108,0.2)" : "transparent"}`,
                cursor: "pointer", transition: "all 0.15s",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px" }}>{layer.emoji}</span>
                <span style={{ fontSize: "0.79rem", fontWeight: on ? "700" : "600", color: on ? "#FF1A6C" : "#888", transition: "color 0.15s" }}>
                  {layer.label}
                </span>
              </div>
              <div style={{
                width: "34px", height: "18px", borderRadius: "9px",
                background: on ? "linear-gradient(135deg, #FF6BA8, #FF1A6C)" : "#e5e7eb",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
                boxShadow: on ? "0 2px 8px rgba(255,26,108,0.3)" : "none",
              }}>
                <div style={{
                  width: "13px", height: "13px", borderRadius: "50%", background: "white",
                  position: "absolute", top: "2.5px",
                  left: on ? "18px" : "3px",
                  transition: "left 0.18s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}