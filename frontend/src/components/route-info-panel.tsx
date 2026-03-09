interface RouteInfoPanelProps {
  crowdScore?: number;
  lightingScore?: number;
}

export default function RouteInfoPanel({ crowdScore, lightingScore }: RouteInfoPanelProps) {

  // Debug logs
  console.log("RouteInfoPanel props:", {
    crowdScore,
    lightingScore,
    crowdType: typeof crowdScore,
    lightingType: typeof lightingScore
  });

  console.log("RouteInfoPanel debug:", {
    crowdScore,
    lightingScore,
    crowdUndefined: crowdScore === undefined,
    lightingUndefined: lightingScore === undefined,
  });

  // Convert numeric score → label + color
  function getRating(score?: number) {
    if (score === undefined) return { label: "--", color: "#aaa" };

    if (score <= 3) {
      return { label: "Poor", color: "#ef4444" };
    }

    if (score <= 7) {
      return { label: "Moderate", color: "#f59e0b" };
    }

    return { label: "Good", color: "#22c55e" };
  }

  const lighting = getRating(lightingScore);
  const crowd = getRating(crowdScore);

  const stats = [
    { label: "Distance", value: "--", unit: "km", color: "#FF6BA8" },
    { label: "Est. Time", value: "--", unit: "min", color: "#c084fc" },
    { label: "Safety", value: "--", unit: "/10", color: "#FF1A6C" },
    { label: "Lighting", value: lighting.label, unit: "", color: lighting.color },
    { label: "Crowd", value: crowd.label, unit: "", color: crowd.color },
  ];

  return (
    <div
      style={{
        fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Stats card */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "14px 14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: "0.62rem",
            color: "#FF1A6C",
            fontWeight: "800",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Route Info
        </div>

        {/* Debug display (temporary) */}
        <div style={{ color: "red", fontWeight: 800, fontSize: "0.7rem", marginBottom: "6px" }}>
          Lighting Debug: {lightingScore} | Crowd Debug: {crowdScore}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                borderRadius: "14px",
                padding: "11px 11px 9px",
                background: `${s.color}14`,
                border: `1.5px solid ${s.color}30`,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: "0.58rem",
                  fontWeight: "800",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: s.color,
                  opacity: 0.85,
                  marginBottom: "4px",
                }}
              >
                {s.label}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "900",
                    color: s.color,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.value}
                </span>

                {s.unit && (
                  <span style={{ fontSize: "0.62rem", color: "#aaa", fontWeight: "700" }}>
                    {s.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}