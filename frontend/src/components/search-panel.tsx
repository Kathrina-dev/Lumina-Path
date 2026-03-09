"use client";

import { useState, useEffect } from "react";
import { geocode, suggest, reverseGeocode, Suggestion } from "../utils/route";

interface SearchPanelProps {
  userLocation?: { lat: number; lon: number } | null;
  onSearch: (dest: { lat: number; lon: number }) => void;
}

export default function SearchPanel({ userLocation, onSearch }: SearchPanelProps) {
  const [dest, setDest] = useState("");
  const [startAddress, setStartAddress] = useState("Acquiring location...");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [lastQuery, setLastQuery] = useState(""); // avoid repeating same geocode call

  const handleSearch = async () => {
    if (loading) return;            // already fetching
    if (!dest || dest === lastQuery) return; // nothing new

    setLoading(true);
    try {
      const location = await geocode(dest);
      if (location) {
        onSearch(location);
        setLastQuery(dest);
      }
    } catch (err) {
      console.error("geocode error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Reverse Geocode ---------------- */

  useEffect(() => {
    if (!userLocation) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const data = await reverseGeocode(userLocation.lat, userLocation.lon);

        if (cancelled) return;

        const short =
          data?.address?.road ||
          data?.address?.suburb ||
          data?.address?.city ||
          data?.address?.town ||
          data?.display_name;

        setStartAddress(short || "Current location");
      } catch {
        setStartAddress("Current location");
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userLocation]);

  /* ---------------- Autocomplete ---------------- */

  useEffect(() => {
    if (dest.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const debounce = setTimeout(async () => {
      try {
        setLoading(true);

        const results = await suggest(dest, 5, controller.signal);

        if (!Array.isArray(results)) {
          setSuggestions([]);
        } else {
          setSuggestions(results);
        }

        setActiveIndex(-1);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("suggest error", err);
        }
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [dest]);

  /* ---------------- Selection ---------------- */

  const selectSuggestion = (s: Suggestion) => {
    setDest(s.display_name);
    setSuggestions([]);

    onSearch({
      lat: parseFloat(s.lat),
      lon: parseFloat(s.lon),
    });
  };

  /* ---------------- Keyboard Navigation ---------------- */

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0) {
        selectSuggestion(suggestions[activeIndex]);
      } else {
        handleSearch();
      }
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      style={{
        width: "290px",
        maxWidth: "100%",
        fontFamily: "'Nunito','Helvetica Neue',sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* CARD */}
      <div
        style={{
          background: "linear-gradient(145deg,#FF6BA8,#FF1A6C)",
          borderRadius: "24px",
          padding: "20px",
          boxShadow: "0 8px 30px rgba(255,26,108,0.35)",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.8)",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Safe Route Planner
        </div>

        <div
          style={{
            fontSize: "1.9rem",
            fontWeight: "900",
            color: "white",
            marginBottom: "16px",
          }}
        >
          Where to?
        </div>

        {/* START */}
        <input
          value={startAddress}
          disabled
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: "14px",
            border: "none",
            marginBottom: "8px",
            background: "rgba(255,255,255,0.22)",
            color: "white",
            fontWeight: "600",
          }}
        />

        {/* DESTINATION */}
        <div style={{ position: "relative" }}>
          <input
            placeholder="Search destination"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "14px",
              border: "none",
              background: "rgba(255,255,255,0.22)",
              color: "white",
              fontWeight: "600",
            }}
          />

          {/* LOADING */}
          {loading && (
            <div
              style={{
                position: "absolute",
                right: "10px",
                top: "11px",
                fontSize: "0.7rem",
                color: "white",
              }}
            >
              ...
            </div>
          )}

          {/* SUGGESTIONS */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                width: "100%",
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
                      background: activeIndex === i ? "#f3f3f3" : "white",
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
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSearch}
        style={{
          width: "100%",
          padding: "13px",
          background: "white",
          color: "#FF1A6C",
          borderRadius: "50px",
          fontWeight: "800",
          border: "2px solid rgba(255,26,108,0.2)",
          cursor: "pointer",
        }}
      >
        Find Safe Route
      </button>
    </div>
  );
}