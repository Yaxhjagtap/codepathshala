import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

export default function Avatar() {
  const [selectedHat, setSelectedHat] = useState("🎩");

  const hats = [
    { id: "top", icon: "🎩", locked: false },
    { id: "crown", icon: "👑", locked: false },
    { id: "grad", icon: "🎓", locked: false },
    { id: "cap", icon: "🧢", locked: false },
    { id: "army", icon: "🪖", locked: true },
    { id: "medic", icon: "⛑️", locked: true },
  ];

  const saveAvatar = () => {
    // 🔥 Firestore save will go here
    alert("Avatar saved successfully! ✨");
  };

  return (
    <div className="layout">
      <Sidebar />

      <main>
        <h1>My Avatar</h1>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>
          Customize your character with items earned from quests!
        </p>

        <div className="card" style={{ display: "flex", gap: "40px" }}>
          {/* Avatar Preview */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "6rem",
                background: "#f1f3ff",
                padding: "30px",
                borderRadius: "24px",
              }}
            >
              🧙‍♂️{selectedHat}
            </div>

            <h3 style={{ marginTop: "12px" }}>Alex</h3>
            <p style={{ color: "#64748b" }}>Level 12 Wizard</p>

            <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
              ⭐ 8 / 24 items unlocked
            </p>
          </div>

          {/* Customization */}
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: "12px" }}>Hats</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              {hats.map((hat) => (
                <div
                  key={hat.id}
                  onClick={() => !hat.locked && setSelectedHat(hat.icon)}
                  style={{
                    fontSize: "2.5rem",
                    padding: "18px",
                    borderRadius: "18px",
                    textAlign: "center",
                    cursor: hat.locked ? "not-allowed" : "pointer",
                    background:
                      selectedHat === hat.icon
                        ? "#e8e9ff"
                        : "#f8f9ff",
                    border:
                      selectedHat === hat.icon
                        ? "2px solid #6c63ff"
                        : "1px solid #e6e9f5",
                    opacity: hat.locked ? 0.4 : 1,
                  }}
                >
                  {hat.icon}
                </div>
              ))}
            </div>

            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              🔒 Complete more quests to unlock new hats!
            </p>

            <button
              className="primary-btn"
              style={{ marginTop: "20px", width: "100%" }}
              onClick={saveAvatar}
            >
              ✨ Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
