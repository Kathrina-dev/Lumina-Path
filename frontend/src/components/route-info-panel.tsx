"use client";

interface RouteInfoPanelProps {
  routes?: Array<{
    type?: string; // "fastest" | "safest" | "balanced"
    distance?: number; 
    safety?: {
      distance?: number;
      crowdScore?: number;
      lightingScore?: number;
      overallScore?: number;
      detailedScores?: Array<{
        lighting?: number;
        crowd?: number;
      }>;
    };
  }>;
  selectedRouteType?: string; // controlled by RouteControls
}

export default function RouteInfoPanel({
  routes,
  selectedRouteType,
}: RouteInfoPanelProps) {
  if (!routes || routes.length === 0) return null;

  // rating helper
  function getRating(score?: number) {
    if (score === undefined) return { label: "--", color: "#aaa" };
    if (score <= 3) return { label: "Poor", color: "#ef4444" };
    if (score <= 7) return { label: "Moderate", color: "#f59e0b" };
    return { label: "Good", color: "#22c55e" };
  }

  // find route to display
  let routeToShow =
    routes.find((r) => r.type === selectedRouteType) ||
    routes.find((r) => r.type === "safest") ||
    routes[0];

  if (!routeToShow) return null;

  const rs = routeToShow.safety || {};
  const dist = rs.distance ?? routeToShow.distance;

  // derive crowd / lighting if missing
  let lightingVal: number | undefined = rs.lightingScore;
  let crowdVal: number | undefined = rs.crowdScore;

  if (
    (lightingVal === undefined || crowdVal === undefined) &&
    Array.isArray(rs.detailedScores)
  ) {
    const scores = rs.detailedScores;

    if (lightingVal === undefined) {
      const sum = scores.reduce((s, d) => s + (d.lighting ?? 0), 0);
      lightingVal = sum / scores.length;
    }

    if (crowdVal === undefined) {
      const sum = scores.reduce((s, d) => s + (d.crowd ?? 0), 0);
      crowdVal = sum / scores.length;
    }
  }

  const lighting = getRating(lightingVal);
  const crowd = getRating(crowdVal);

  const stats = [
    {
      label: "Distance",
      value: dist !== undefined ? (dist / 1000).toFixed(2) : "--",
      unit: "km",
      color: "#FF6BA8",
    },
    {
      label: "Est. Time",
      value: dist !== undefined ? Math.round((dist / 1000) * 12).toString() : "--",
      unit: "min",
      color: "#c084fc",
    },
    {
      label: "Safety",
      value: rs.overallScore !== undefined ? rs.overallScore.toFixed(1) : "--",
      unit: "/10",
      color: "#FF1A6C",
    },
    {
      label: "Lighting",
      value: lighting.label,
      unit: "",
      color: lighting.color,
    },
    {
      label: "Crowd",
      value: crowd.label,
      unit: "",
      color: crowd.color,
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
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

        {/* Route Type */}
        {routeToShow.type && (
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              marginBottom: "8px",
              textTransform: "capitalize",
              color: "#333",
            }}
          >
            {routeToShow.type}
          </div>
        )}

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "7px",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                borderRadius: "14px",
                padding: "11px 11px 9px",
                background: `${s.color}14`,
                border: `1.5px solid ${s.color}30`,
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
                  <span
                    style={{
                      fontSize: "0.62rem",
                      color: "#aaa",
                      fontWeight: "700",
                    }}
                  >
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