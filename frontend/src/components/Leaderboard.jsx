import { getLeaderboard } from "../services/api";
import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getLeaderboard().then(res => setList(res.data));
  }, []);

  return (
    <ul>
      {list.map((u, i) => (
        <li key={i}>{u.name} — {u.xp} XP</li>
      ))}
    </ul>
  );
}
