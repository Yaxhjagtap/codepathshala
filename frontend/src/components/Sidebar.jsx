import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>CodePathshala</h2>

      <NavLink to="/dashboard">
        <span>🏠</span> Home
      </NavLink>
      <NavLink to="/quests">
        <span>🗺️</span> Quest Map
      </NavLink>
       <NavLink 
          to="/labs" 
          className={({ isActive }) => 
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">🧪</span>
          <span className="nav-text">Coding Labs</span>
        </NavLink>
        
        <NavLink 
          to="/code" 
          className={({ isActive }) => 
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">💻</span>
          <span className="nav-text">Code editor</span>
        </NavLink>
      <NavLink to="/leaderboard">
        <span>🏆</span> Leaderboard
      </NavLink>
      <NavLink to="/mentor">
        <span>🤖</span> AI Mentor
      </NavLink>
      <NavLink to="/avatar">
        <span>👤</span> My Avatar
      </NavLink>
    </aside>
  );
}