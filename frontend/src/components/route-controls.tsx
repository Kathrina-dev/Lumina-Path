"use client";
import { useState, useEffect } from "react";

const routes = [
  { key: "safest",   label: "Safest",   sub: "Well-lit & populated",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="currentColor"/></svg> },
  { key: "balanced", label: "Balanced", sub: "Safety + speed",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg> },
  { key: "fastest",  label: "Fastest",  sub: "Shortest time",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" fill="currentColor"/></svg> },
];

type RouteKey = "safest" | "balanced" | "fastest";

interface RouteControlsProps {
  selected?: RouteKey;
  onChange?: (key: RouteKey) => void;
}

export default function RouteControls({ selected: propSelected, onChange }: RouteControlsProps) {
  const [selected, setSelected] = useState<string>(propSelected || "safest");

  // keep local state in sync if parent controls it
  useEffect(() => {
    if (propSelected !== undefined && propSelected !== selected) {
      setSelected(propSelected);
    }
  }, [propSelected]);

  return (
    <div style={{
      width: "100%", boxSizing: "border-box",
      fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
    }}>
      <div style={{
        background: "white", borderRadius: "20px",
        padding: "14px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        boxSizing: "border-box",
      }}>
        <div style={{ fontSize: "0.62rem", color: "#FF1A6C", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
          Route Preference
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {routes.map((r) => {
            const active = selected === r.key;
            return (
              <button
                key={r.key}
                onClick={() => {
                  setSelected(r.key);
                  // r.key is typed as string; assert RouteKey
                  onChange?.(r.key as RouteKey);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "9px 12px", borderRadius: "13px", border: "none",
                  background: active ? "linear-gradient(135deg, #FF6BA8, #FF1A6C)" : "rgba(255,26,108,0.06)",
                  color: active ? "white" : "#666",
                  cursor: "pointer", textAlign: "left",
                  fontFamily: "inherit", transition: "all 0.15s",
                  boxShadow: active ? "0 4px 14px rgba(255,26,108,0.3)" : "none",
                  width: "100%", boxSizing: "border-box",
                }}
              >
                <span style={{ opacity: active ? 1 : 0.45, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "0.82rem" }}>{r.label}</div>
                  <div style={{ fontSize: "0.64rem", opacity: 0.72, marginTop: "1px" }}>{r.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}