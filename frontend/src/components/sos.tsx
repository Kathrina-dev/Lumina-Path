"use client";
import { useState } from "react";

const CONTACTS = [
  { name: "Mom",    initial: "M" },
  { name: "Sister", initial: "S" },
  { name: "Friend", initial: "F" },
  { name: "Emergency Services", initial: "E" },
];

export default function SOSBlock() {
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);


  const startSOS = () => {
    try {

    navigator.geolocation.getCurrentPosition(async (position) => {

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const res = await fetch("http://localhost:5000/api/sos/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: "user124",
          latitude,
          longitude
        })
      });

      const data = await res.json();
      console.log("SOS response:", data);

    });

  } catch (err) {
    console.error("SOS failed", err);
  }
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
      background: "white",
      borderRadius: "20px",
      padding: "14px 14px",
      boxShadow: triggered
        ? "0 0 0 2.5px #FF1A6C, 0 8px 24px rgba(255,26,108,0.22)"
        : "0 4px 20px rgba(0,0,0,0.08)",
      transition: "box-shadow 0.3s",
    }}>

      {/* Section label */}
      <div style={{ fontSize: "0.62rem", color: "#FF1A6C", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
        Emergency SOS
      </div>

      {/* Alert contacts */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "0.6rem", color: "#999", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "7px" }}>
          Alert contacts
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {CONTACTS.map((c) => (
            <div key={c.name} style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: "rgba(255,26,108,0.07)",
              border: "1.5px solid rgba(255,26,108,0.18)",
              borderRadius: "20px", padding: "4px 10px 4px 5px",
            }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: "0.6rem", color: "white", fontWeight: "800" }}>{c.initial}</span>
              </div>
              <span style={{ fontSize: "0.74rem", fontWeight: "700", color: "#FF1A6C" }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share location row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 12px", borderRadius: "13px",
        background: "#f9f9f9", border: "1.5px solid transparent",
        marginBottom: "11px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF1A6C"/>
          </svg>
          <span style={{ fontSize: "0.79rem", fontWeight: "700", color: "#444" }}>Share live location</span>
        </div>
        {/* Toggle pill — always on */}
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

      {/* SOS button */}
      {!triggered ? (
        <button
          onClick={startSOS}
          style={{
            width: "100%", padding: "12px",
            background: countdown !== null ? "rgba(255,26,108,0.07)" : "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
            color: countdown !== null ? "#FF1A6C" : "white",
            border: countdown !== null ? "2px solid #FF1A6C" : "none",
            borderRadius: "13px",
            fontSize: countdown !== null ? "0.95rem" : "0.88rem",
            fontWeight: "900", cursor: "pointer",
            fontFamily: "inherit", letterSpacing: "0.03em",
            boxShadow: countdown !== null ? "none" : "0 4px 16px rgba(255,26,108,0.38)",
            transition: "all 0.2s", boxSizing: "border-box",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {countdown !== null ? (
            <span>Sending in {countdown}… <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>(tap to cancel)</span></span>
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
          display: "flex", alignItems: "center", gap: "10px",
          padding: "11px 13px", borderRadius: "13px",
          background: "rgba(255,26,108,0.06)", border: "1.5px solid rgba(255,26,108,0.2)",
          boxSizing: "border-box",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6BA8, #FF1A6C)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.8rem", color: "#FF1A6C" }}>Alert sent!</div>
            <div style={{ fontSize: "0.65rem", color: "#888", marginTop: "1px" }}>Contacts notified with your location</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes lp-pulse-border {
          0%, 100% { box-shadow: 0 0 0 2.5px #FF1A6C, 0 8px 24px rgba(255,26,108,0.22); }
          50%       { box-shadow: 0 0 0 5px rgba(255,26,108,0.3), 0 8px 28px rgba(255,26,108,0.3); }
        }
      `}</style>
    </div>
  );
}