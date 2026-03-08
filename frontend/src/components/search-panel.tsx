export default function SearchPanel() {
  return (
    <div style={{
      width: "290px",
      maxWidth: "100%",
      fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      boxSizing: "border-box",
    }}>
      {/* Hero gradient card */}
      <div style={{
        background: "linear-gradient(145deg, #FF6BA8 0%, #FF1A6C 100%)",
        borderRadius: "24px",
        padding: "20px 20px 18px",
        boxShadow: "0 8px 30px rgba(255,26,108,0.35)",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20px", right: "20px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.8)", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
          Safe Route Planner
        </div>
        <div style={{ fontSize: "1.9rem", fontWeight: "900", color: "white", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "16px" }}>
          Where to?
        </div>

        {/* Start */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <div style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#4ade80", boxShadow: "0 0 0 2px rgba(255,255,255,0.6)",
          }} />
          <input
            type="text"
            placeholder="Start location"
            style={{
              width: "100%", padding: "11px 12px 11px 30px",
              border: "none", borderRadius: "14px",
              background: "rgba(255,255,255,0.22)",
              color: "white", fontSize: "0.85rem", fontWeight: "600",
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onFocus={(e) => e.target.style.background = "rgba(255,255,255,0.32)"}
            onBlur={(e) => e.target.style.background = "rgba(255,255,255,0.22)"}
          />
        </div>

        {/* Destination */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", left: "13px", top: "50%",
            width: "8px", height: "8px",
            background: "white",
            transform: "translateY(-50%) rotate(45deg)",
            boxShadow: "0 0 0 2px rgba(255,255,255,0.35)",
          }} />
          <input
            type="text"
            placeholder="Destination"
            style={{
              width: "100%", padding: "11px 12px 11px 30px",
              border: "none", borderRadius: "14px",
              background: "rgba(255,255,255,0.22)",
              color: "white", fontSize: "0.85rem", fontWeight: "600",
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onFocus={(e) => e.target.style.background = "rgba(255,255,255,0.32)"}
            onBlur={(e) => e.target.style.background = "rgba(255,255,255,0.22)"}
          />
        </div>
      </div>

      {/* Pill CTA */}
      <button
        style={{
          width: "100%", padding: "13px",
          background: "white", color: "#FF1A6C",
          border: "2px solid rgba(255,26,108,0.2)",
          borderRadius: "50px",
          fontSize: "0.88rem", fontWeight: "800",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          boxShadow: "0 4px 16px rgba(255,26,108,0.15)",
          fontFamily: "inherit", letterSpacing: "0.01em",
          transition: "all 0.15s", boxSizing: "border-box",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF1A6C"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; (e.currentTarget as HTMLButtonElement).style.color = "#FF1A6C"; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
        </svg>
        Find Safe Route
      </button>
    </div>
  );
}