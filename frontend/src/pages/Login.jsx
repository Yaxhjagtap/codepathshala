import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/auth"; // Update this import too
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date()
      });
      
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-back" onClick={() => navigate("/")}>
          ← Back to Home
        </div>

        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">
          Continue your coding quest
        </p>

        <input
          className="auth-input"
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <button className="auth-btn" onClick={login}>
          Start Coding! ✨
        </button>

        <div className="auth-switch">
          New to CodePathshala?{" "}
          <span onClick={() => navigate("/register")}>Sign up</span>
        </div>
      </div>
    </div>
  );
}