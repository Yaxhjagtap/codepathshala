import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>CodePathshala</h2>

      <NavLink to="/dashboard">Home</NavLink>
      <NavLink to="/quests">Quest Map</NavLink>
      <NavLink to="/code">Code Lab</NavLink>
      <NavLink to="/leaderboard">Leaderboard</NavLink>
      <NavLink to="/mentor">AI Mentor</NavLink>
      <NavLink to="/avatar">My Avatar</NavLink>
    </aside>
  );
}
