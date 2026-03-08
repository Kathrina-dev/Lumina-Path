export default function RouteInfoPanel() {
  const stats = [
    { label: "Distance",  value: "--", unit: "km",  color: "#FF6BA8" },
    { label: "Est. Time", value: "--", unit: "min", color: "#c084fc" },
    { label: "Safety",    value: "--", unit: "/10", color: "#FF1A6C" },
    { label: "Lighting",  value: "--", unit: "/10", color: "#fbbf24" },
  ];

  return (
    <div style={{
      fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
      display: "flex", flexDirection: "column", gap: "8px",
      width: "100%", boxSizing: "border-box",
    }}>
      {/* Stats card */}
      <div style={{
        background: "white", borderRadius: "20px",
        padding: "14px 14px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        boxSizing: "border-box",
      }}>
        <div style={{ fontSize: "0.62rem", color: "#FF1A6C", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
          Route Info
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              borderRadius: "14px", padding: "11px 11px 9px",
              background: `${s.color}14`,
              border: `1.5px solid ${s.color}30`,
              boxSizing: "border-box",
            }}>
              <div style={{ fontSize: "0.58rem", fontWeight: "800", letterSpacing: "0.08em", textTransform: "uppercase", color: s.color, opacity: 0.85, marginBottom: "4px" }}>
                {s.label}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <span style={{ fontSize: "1.4rem", fontWeight: "900", color: "#1a1a1a", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</span>
                <span style={{ fontSize: "0.62rem", color: "#aaa", fontWeight: "700" }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA chip
      <div style={{
        background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
        borderRadius: "16px", padding: "12px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 18px rgba(255,26,108,0.3)",
        cursor: "pointer", boxSizing: "border-box",
      }}>
        <div>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.8)", fontWeight: "700", letterSpacing: "0.04em", marginBottom: "2px" }}>
            Ready to navigate?
          </div>
          <div style={{ fontSize: "0.76rem", color: "white", fontWeight: "800" }}>Select a route above</div>
        </div>
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          background: "rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div> */}
    </div>
  );
}