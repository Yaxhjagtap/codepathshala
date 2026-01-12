import { useEffect, useState } from "react";
import { db } from "../firebase/auth";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Leaderboard({ compact = false }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const usersQuery = query(
        collection(db, "users"),
        orderBy("xp", "desc"),
        limit(compact ? 3 : 10)
      );
      
      const snapshot = await getDocs(usersQuery);
      const leaderboardData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (compact) {
    return (
      <div className="leaderboard-preview">
        {leaderboard.map((player, index) => (
          <div 
            key={player.id} 
            className="leaderboard-item"
          >
            <div className="leaderboard-rank">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
            </div>
            <div className="leaderboard-avatar">
              {player.avatar || "🧙‍♂️"}
            </div>
            <div className="leaderboard-info">
              <strong>{player.username || "Player"}</strong>
              <span>Level {player.level || 1}</span>
            </div>
            <div className="leaderboard-xp">
              {player.xp || 0} XP
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="leaderboard-full">
      <div className="table-header">
        <div className="rank-col">Rank</div>
        <div className="player-col">Player</div>
        <div className="xp-col">XP</div>
      </div>
      
      {leaderboard.map((player) => (
        <div key={player.id} className="table-row">
          <div className="rank-col">#{player.rank}</div>
          <div className="player-col">
            <span className="player-avatar">{player.avatar || "🧙‍♂️"}</span>
            <span>{player.username || "Player"}</span>
          </div>
          <div className="xp-col">{player.xp || 0} XP</div>
        </div>
      ))}
      
      <button 
        className="view-all-btn"
        onClick={() => navigate("/leaderboard")}
      >
        View Full Leaderboard →
      </button>
    </div>
  );
}