import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";
import "../styles/dashboard.css";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getLeaderboard().then(setUsers);
  }, []);

  return users.map(u => (
    <div key={u.name}>
      {u.name} – {u.xp} XP
    </div>
  ));
}
