import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const avatars = ["🧙‍♂️", "🧑‍🚀", "🧝‍♀️", "🤖", "🦊", "🐉", "🦄", "🐱"];

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const navigate = useNavigate();

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-back" onClick={() => navigate("/")}>
          ← Back to Home
        </div>

        <h2 className="auth-title">Join the Adventure!</h2>
        <p className="auth-subtitle">
          Create your Little Wizard account
        </p>

        <p className="text-sm mb-2 font-medium">Choose Your Avatar</p>
        <div className="avatar-grid">
          {avatars.map((a) => (
            <div
              key={a}
              className={`avatar ${avatar === a ? "selected" : ""}`}
              onClick={() => setAvatar(a)}
            >
              {a}
            </div>
          ))}
        </div>

        <input
          className="auth-input"
          placeholder="Choose a cool username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Parent's email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={register}>
          Create Account ✨
        </button>

        <div className="auth-switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Log in</span>
        </div>
      </div>
    </div>
  );
}
