"use client";
import { useState, useEffect } from "react";

const TAGS = [
  { key: "dark", label: "Poor Lighting", emoji: "🌑" },
  { key: "unsafe", label: "Felt Unsafe", emoji: "⚠️" },
  { key: "crowd", label: "No People", emoji: "👥" },
  { key: "harassed", label: "Harassment", emoji: "🚨" },
  { key: "good", label: "Well Lit", emoji: "💡" },
  { key: "busy", label: "Busy Street", emoji: "🏙️" },
];

const TAG_TO_API: Record<string, string> = {
  dark: "dark_street",
  unsafe: "unsafe_crowd",
  crowd: "unsafe_crowd",
  harassed: "harassment",
  good: "other",
  busy: "other",
};

export default function SafetyReportBlock() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleTag = (k: string) =>
    setSelectedTags((p) =>
      p.includes(k) ? p.filter((t) => t !== k) : [...p, k]
    );

  /* Reverse Geocoding */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      setCoords({ lat, lon });

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        if (data.display_name) setLocation(data.display_name);
      } catch (err) {
        console.error("Reverse geocode failed", err);
      }
    });
  }, []);

  /* Search */
  const searchLocation = async (q: string) => {
    setLocation(q);

    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectSuggestion = (place: any) => {
    setLocation(place.display_name);
    setCoords({
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    });
    setSuggestions([]);
  };

  /* Submit */
  const submit = async () => {
  if (selectedTags.length === 0) return;

  setLoading(true);

  try {
    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const lat = coords?.lat;
    const lon = coords?.lon;

    if (!lat || !lon) {
      setLoading(false);
      return;
    }

    /* Reverse Geocode again for API */
    let address = location;

    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const geoData = await geo.json();

      if (geoData.display_name) {
        address = geoData.display_name;
      }
    } catch (err) {
      console.error("Reverse geocode failed", err);
    }

    const type = TAG_TO_API[selectedTags[0]] || "other";

    const severity =
      selectedTags.includes("harassed")
        ? 5
        : selectedTags.includes("unsafe")
        ? 4
        : selectedTags.includes("dark")
        ? 3
        : 2;

    const res = await fetch(`${base}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat,
        lon,
        location: address, // ✅ reverse geocoded address sent
        type,
        severity,
        description: note || selectedTags.join(", "),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("API error:", data);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);

    setTimeout(() => {
      setSubmitted(false);
      setSelectedTags([]);
      setNote("");
    }, 3000);
  } catch (err) {
    console.error("Report failed:", err);
    setLoading(false);
  }
};

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
        background: "white",
        borderRadius: "20px",
        padding: "14px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          fontSize: "0.62rem",
          color: "#FF1A6C",
          fontWeight: "800",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Report This Area
      </div>

      {submitted ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontWeight: 800 }}>Thank you!</div>
          <div style={{ fontSize: "0.7rem", color: "#888" }}>
            Your report helps keep women safe
          </div>
        </div>
      ) : (
        <>
          {/* Location */}
          <div style={{ marginBottom: "10px", position: "relative" }}>
            <div
              style={{
                fontSize: "0.6rem",
                color: "#999",
                fontWeight: "700",
                marginBottom: "6px",
              }}
            >
              Location
            </div>

            <input
              type="text"
              placeholder="Current location or address"
              value={location}
              onChange={(e) => searchLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 10px",
                border: "1.5px solid #f0f0f0",
                borderRadius: "11px",
                background: "#f9f9f9",
                fontSize: "0.78rem",
                color: "#333",
                outline: "none",
              }}
            />

            {suggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  left: 0,
                  right: 0,
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
                  zIndex: 100,
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {suggestions.map((s, i) => {
                  const parts = s.display_name.split(",");

                  return (
                    <div
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding: "10px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f1f1f1",
                      }}
                    >
                      <div style={{ fontSize: "14px" }}>📍</div>

                      <div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color: "#333",
                          }}
                        >
                          {parts[0]}
                        </div>

                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "#888",
                          }}
                        >
                          {parts.slice(1).join(",")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {TAGS.map((tag) => {
              const active = selectedTags.includes(tag.key);

              return (
                <button
                  key={tag.key}
                  onClick={() => toggleTag(tag.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 10px",
                    borderRadius: "11px",
                    border: active ? "none" : "1.5px solid #f0f0f0",
                    background: active
                      ? "linear-gradient(135deg, #FF6BA8, #FF1A6C)"
                      : "#f9f9f9",
                    color: active ? "white" : "#666",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  <span>{tag.emoji}</span>
                  {tag.label}
                </button>
              );
            })}
          </div>

          {/* Notes */}
          <textarea
            placeholder="Describe what you experienced…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              padding: "9px 11px",
              border: "1.5px solid #f0f0f0",
              borderRadius: "11px",
              background: "#f9f9f9",
              fontSize: "0.78rem",
              marginBottom: "10px",
            }}
          />

          <button
            onClick={submit}
            disabled={loading || selectedTags.length === 0}
            style={{
              width: "100%",
              padding: "11px",
              background:
                selectedTags.length > 0
                  ? "linear-gradient(135deg, #FF6BA8, #FF1A6C)"
                  : "#f0f0f0",
              color: selectedTags.length > 0 ? "white" : "#bbb",
              border: "none",
              borderRadius: "13px",
              fontWeight: "800",
              cursor: selectedTags.length > 0 ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </>
      )}
    </div>
  );
}