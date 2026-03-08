"use client";
import { useState } from "react";

const TAGS = [
  { key: "dark",      label: "Poor Lighting",  emoji: "🌑" },
  { key: "unsafe",    label: "Felt Unsafe",     emoji: "⚠️" },
  { key: "crowd",     label: "No People",       emoji: "👥" },
  { key: "harassed",  label: "Harassment",      emoji: "🚨" },
  { key: "good",      label: "Well Lit",        emoji: "💡" },
  { key: "busy",      label: "Busy Street",     emoji: "🏙️" },
];

type Report = { tags: string[]; note: string; location: string };

export default function SafetyReportBlock() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (k: string) =>
    setSelectedTags((p) => p.includes(k) ? p.filter((t) => t !== k) : [...p, k]);

  const submit = () => {
    if (selectedTags.length === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedTags([]);
      setNote("");
      setLocation("");
    }, 3000);
  };

  return (
    <div style={{
      width: "100%", boxSizing: "border-box",
      fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
    }}>
      <div style={{
        borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
          padding: "12px 14px 10px",
          display: "flex", alignItems: "center", gap: "9px",
        }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "rgba(255,255,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "white", lineHeight: 1.1 }}>Report This Area</div>
            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.75)", fontWeight: "600" }}>Help others stay safe</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ background: "white", padding: "14px" }}>

          {submitted ? (
            /* Success state */
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "20px 10px", gap: "10px",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(255,26,108,0.35)",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "800", fontSize: "0.9rem", color: "#1a1a1a" }}>Thank you!</div>
                <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "3px" }}>Your report helps keep women safe</div>
              </div>
            </div>
          ) : (
            <>
              {/* Location input */}
              <div style={{ marginBottom: "11px" }}>
                <div style={{ fontSize: "0.6rem", color: "#999", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Location
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF1A6C" opacity="0.7"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Current location or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{
                      width: "100%", padding: "9px 10px 9px 28px",
                      border: "1.5px solid #f0f0f0", borderRadius: "11px",
                      background: "#fafafa", fontSize: "0.78rem",
                      color: "#333", outline: "none",
                      boxSizing: "border-box", fontFamily: "inherit",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#FF1A6C"}
                    onBlur={(e) => e.target.style.borderColor = "#f0f0f0"}
                  />
                </div>
              </div>

              {/* Tag grid */}
              <div style={{ marginBottom: "11px" }}>
                <div style={{ fontSize: "0.6rem", color: "#999", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "7px" }}>
                  What did you notice?
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {TAGS.map((tag) => {
                    const active = selectedTags.includes(tag.key);
                    return (
                      <button
                        key={tag.key}
                        onClick={() => toggleTag(tag.key)}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          padding: "7px 10px", borderRadius: "11px",
                          border: active ? "none" : "1.5px solid #f0f0f0",
                          background: active
                            ? "linear-gradient(135deg, #FF6BA8, #FF1A6C)"
                            : "#f9f9f9",
                          color: active ? "white" : "#666",
                          cursor: "pointer", fontFamily: "inherit",
                          fontSize: "0.72rem", fontWeight: "700",
                          textAlign: "left",
                          transition: "all 0.15s",
                          boxShadow: active ? "0 3px 10px rgba(255,26,108,0.28)" : "none",
                          boxSizing: "border-box",
                        }}
                      >
                        <span style={{ fontSize: "12px" }}>{tag.emoji}</span>
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes textarea */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "0.6rem", color: "#999", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Add a note (optional)
                </div>
                <textarea
                  placeholder="Describe what you experienced…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%", padding: "9px 11px",
                    border: "1.5px solid #f0f0f0", borderRadius: "11px",
                    background: "#fafafa", fontSize: "0.78rem",
                    color: "#333", outline: "none", resize: "none",
                    boxSizing: "border-box", fontFamily: "inherit",
                    lineHeight: 1.5, transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#FF1A6C"}
                  onBlur={(e) => e.target.style.borderColor = "#f0f0f0"}
                />
              </div>

              {/* Submit */}
              <button
                onClick={submit}
                disabled={selectedTags.length === 0}
                style={{
                  width: "100%", padding: "11px",
                  background: selectedTags.length > 0
                    ? "linear-gradient(135deg, #FF6BA8, #FF1A6C)"
                    : "#f0f0f0",
                  color: selectedTags.length > 0 ? "white" : "#bbb",
                  border: "none", borderRadius: "13px",
                  fontSize: "0.84rem", fontWeight: "800",
                  cursor: selectedTags.length > 0 ? "pointer" : "not-allowed",
                  fontFamily: "inherit", letterSpacing: "0.02em",
                  boxShadow: selectedTags.length > 0 ? "0 4px 16px rgba(255,26,108,0.35)" : "none",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  boxSizing: "border-box",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Submit Report
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}