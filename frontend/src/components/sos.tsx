"use client";
import { useState } from "react";

const CONTACTS = ["Mom", "Sister", "Friend"];

export default function SOSBlock() {
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);

  const startSOS = () => {
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        setTriggered(true);
      } else {
        setCountdown(count);
      }
    }, 1000);
    setTimerRef(interval);
  };

  const cancel = () => {
    if (timerRef) clearInterval(timerRef);
    setCountdown(null);
    setTriggered(false);
  };

  return (
    <div style={{
      width: "100%", boxSizing: "border-box",
      fontFamily: "'Nunito', 'Helvetica Neue', sans-serif",
    }}>
      <div style={{
        borderRadius: "20px", overflow: "hidden",
        boxShadow: triggered
          ? "0 0 0 3px #FF1A6C, 0 8px 30px rgba(255,26,108,0.4)"
          : "0 4px 20px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.3s",
      }}>

        {/* Header strip */}
        <div style={{
          background: triggered
            ? "linear-gradient(135deg, #FF1A6C, #b91c1c)"
            : "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
          padding: "12px 14px 10px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: triggered ? "lp-pulse 1s infinite" : "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1 .37 1.98.72 2.91a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.93.35 1.9.59 2.91.72A2 2 0 0122 16.92z" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "white", lineHeight: 1.1 }}>Emergency SOS</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.75)", fontWeight: "600" }}>
                {triggered ? "Alert sent to contacts" : "Hold to alert contacts"}
              </div>
            </div>
          </div>
          {triggered && (
            <button onClick={cancel} style={{
              background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px",
              padding: "4px 9px", color: "white", fontSize: "0.65rem", fontWeight: "800",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Cancel
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ background: "white", padding: "14px 14px" }}>

          {/* Trusted contacts */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "0.6rem", color: "#999", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "7px" }}>
              Alert contacts
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {CONTACTS.map((c) => (
                <div key={c} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  background: "rgba(255,26,108,0.07)",
                  border: "1.5px solid rgba(255,26,108,0.18)",
                  borderRadius: "20px", padding: "4px 10px 4px 7px",
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "9px", color: "white", fontWeight: "800" }}>{c[0]}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#FF1A6C" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Share location toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 10px", borderRadius: "12px",
            background: "#f9f9f9", border: "1.5px solid #f0f0f0",
            marginBottom: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF1A6C"/>
              </svg>
              <span style={{ fontSize: "0.76rem", fontWeight: "700", color: "#444" }}>Share live location</span>
            </div>
            <div style={{
              width: "34px", height: "18px", borderRadius: "9px",
              background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
              position: "relative", flexShrink: 0,
              boxShadow: "0 2px 8px rgba(255,26,108,0.3)",
            }}>
              <div style={{
                width: "13px", height: "13px", borderRadius: "50%", background: "white",
                position: "absolute", top: "2.5px", left: "18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
              }} />
            </div>
          </div>

          {/* SOS Button */}
          {!triggered ? (
            <button
              onClick={startSOS}
              style={{
                width: "100%", padding: "13px",
                background: countdown !== null
                  ? "#fff0f5"
                  : "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
                color: countdown !== null ? "#FF1A6C" : "white",
                border: countdown !== null ? "2px solid #FF1A6C" : "none",
                borderRadius: "14px",
                fontSize: countdown !== null ? "1.1rem" : "0.88rem",
                fontWeight: "900",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: countdown !== null ? "0" : "0.04em",
                boxShadow: countdown !== null ? "none" : "0 4px 18px rgba(255,26,108,0.4)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {countdown !== null ? (
                <>Sending in {countdown}… <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>(tap to cancel)</span></>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1 .37 1.98.72 2.91a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.93.35 1.9.59 2.91.72A2 2 0 0122 16.92z" fill="white"/>
                  </svg>
                  Send SOS Alert
                </>
              )}
            </button>
          ) : (
            <div style={{
              width: "100%", padding: "12px",
              background: "rgba(255,26,108,0.06)",
              border: "2px solid rgba(255,26,108,0.25)",
              borderRadius: "14px",
              display: "flex", alignItems: "center", gap: "10px",
              boxSizing: "border-box",
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "0.8rem", color: "#FF1A6C" }}>Alert sent!</div>
                <div style={{ fontSize: "0.65rem", color: "#888", marginTop: "1px" }}>Contacts notified with your location</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes lp-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}