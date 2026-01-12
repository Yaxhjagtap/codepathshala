import { useEffect, useState } from "react";
import { auth, db } from "../firebase/auth";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import "../styles/leaderboard.css";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [ageFilter, setAgeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchLeaderboard(user.uid);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchLeaderboard(currentUser.uid);
    }
  }, [ageFilter, currentUser]);

  const fetchLeaderboard = async (userId) => {
    setLoading(true);
    try {
      // Fetch all users ordered by XP
      const usersQuery = query(
        collection(db, "users"),
        orderBy("xp", "desc"),
        limit(50)
      );
      
      const snapshot = await getDocs(usersQuery);
      let leaderboardData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));

      // Filter by age group on client side if needed
      if (ageFilter !== "all") {
        leaderboardData = leaderboardData.filter(player => player.ageGroup === ageFilter);
        // Recalculate ranks
        leaderboardData = leaderboardData.map((player, index) => ({
          ...player,
          rank: index + 1
        }));
      }
      
      setLeaderboard(leaderboardData);
      
      // Find user's rank
      const userIndex = leaderboardData.findIndex(player => player.id === userId);
      if (userIndex !== -1) {
        setUserRank(leaderboardData[userIndex]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Fallback to mock data for testing
      setLeaderboard([
        { id: "1", rank: 1, username: "WizardKing", avatar: "🧙‍♂️", xp: 5000, level: 5, ageGroup: "9-11", completedQuests: 25, totalQuests: 30, streak: 7 },
        { id: "2", rank: 2, username: "CodeMaster", avatar: "🤖", xp: 4500, level: 5, ageGroup: "12-14", completedQuests: 22, totalQuests: 30, streak: 5 },
        { id: "3", rank: 3, username: "PixelNinja", avatar: "🐱", xp: 4000, level: 4, ageGroup: "9-11", completedQuests: 20, totalQuests: 30, streak: 3 },
        { id: "4", rank: 4, username: "ByteWizard", avatar: "🧝‍♀️", xp: 3500, level: 4, ageGroup: "15-16", completedQuests: 18, totalQuests: 30, streak: 10 },
        { id: "5", rank: 5, username: "LoopLegend", avatar: "🦊", xp: 3000, level: 3, ageGroup: "12-14", completedQuests: 15, totalQuests: 30, streak: 2 }
      ]);
    }
    setLoading(false);
  };

  const getAgeGroupLabel = (ageGroup) => {
    switch(ageGroup) {
      case "6-8": return "6-8 years";
      case "9-11": return "9-11 years";
      case "12-14": return "12-14 years";
      case "15-16": return "15-16 years";
      default: return "All ages";
    }
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return "";
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="leaderboard-main">
        {/* Header with Back Button */}
        <div className="leaderboard-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <div className="header-content">
            <h1>🏆 Global Leaderboard</h1>
            <p>See how you rank against other wizards!</p>
          </div>
        </div>

        {/* Age Filters */}
        <div className="age-filters">
          <button 
            className={`filter-btn ${ageFilter === "all" ? "active" : ""}`}
            onClick={() => setAgeFilter("all")}
          >
            All Ages
          </button>
          {["6-8", "9-11", "12-14", "15-16"].map(age => (
            <button
              key={age}
              className={`filter-btn ${ageFilter === age ? "active" : ""}`}
              onClick={() => setAgeFilter(age)}
            >
              {getAgeGroupLabel(age)}
            </button>
          ))}
        </div>

        {/* User's Rank Card */}
        {userRank && (
          <div className="user-rank-card">
            <h3>Your Position</h3>
            <div className="user-rank-info">
              <div className="user-rank" style={{ color: getMedalColor(userRank.rank) }}>
                #{userRank.rank || "N/A"}
              </div>
              <div className="user-avatar-large">{userRank.avatar || "🧙‍♂️"}</div>
              <div className="user-details">
                <h4>{userRank.username || "Player"}</h4>
                <p>Level {userRank.level || 1} • {getAgeGroupLabel(userRank.ageGroup)}</p>
              </div>
              <div className="user-xp">
                <strong>{userRank.xp?.toLocaleString() || 0} XP</strong>
                <p>Total Experience</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="leaderboard-table-container">
          <div className="table-header">
            <div className="rank-col">Rank</div>
            <div className="player-col">Player</div>
            <div className="level-col">Level</div>
            <div className="xp-col">XP</div>
            <div className="age-col">Age</div>
            <div className="quests-col">Quests</div>
          </div>
          
          {leaderboard.length > 0 ? (
            leaderboard.map((player) => (
              <div 
                key={player.id} 
                className={`table-row ${player.id === currentUser?.uid ? "current-user" : ""}`}
              >
                <div className="rank-col">
                  {player.rank <= 3 ? (
                    <div className="medal" style={{ color: getMedalColor(player.rank) }}>
                      {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}
                    </div>
                  ) : (
                    <span className="rank-number">#{player.rank}</span>
                  )}
                </div>
                <div className="player-col">
                  <div className="player-info">
                    <span className="player-avatar">{player.avatar || "🧙‍♂️"}</span>
                    <div className="player-details">
                      <strong>{player.username || "Player"}</strong>
                      <span className="player-streak">
                        {player.streak ? `🔥 ${player.streak} day streak` : "New player"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="level-col">
                  <div className="level-badge">
                    <span className="level-icon">⭐</span>
                    <span>Level {player.level || 1}</span>
                  </div>
                </div>
                <div className="xp-col">
                  <strong>{player.xp?.toLocaleString() || 0}</strong>
                  <div className="xp-progress">
                    <div 
                      className="xp-bar" 
                      style={{ 
                        width: `${Math.min(((player.xp || 0) / 10000) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="age-col">
                  <span className="age-badge">{getAgeGroupLabel(player.ageGroup)}</span>
                </div>
                <div className="quests-col">
                  <div className="quests-info">
                    <span className="completed-quests">
                      ✅ {player.completedQuests || 0}
                    </span>
                    <span className="total-quests">
                      /{player.totalQuests || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-leaderboard">
              <p>No players found. Be the first to join the leaderboard!</p>
              <button 
                className="primary-btn"
                onClick={() => navigate("/dashboard")}
              >
                Start Coding
              </button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <div className="leaderboard-stats">
            <div className="stat-card">
              <h4>Total Players</h4>
              <p className="stat-number">{leaderboard.length}</p>
            </div>
            <div className="stat-card">
              <h4>Average XP</h4>
              <p className="stat-number">
                {Math.round(leaderboard.reduce((acc, p) => acc + (p.xp || 0), 0) / leaderboard.length) || 0}
              </p>
            </div>
            <div className="stat-card">
              <h4>Average Level</h4>
              <p className="stat-number">
                {Math.round(leaderboard.reduce((acc, p) => acc + (p.level || 1), 0) / leaderboard.length) || 1}
              </p>
            </div>
            <div className="stat-card">
              <h4>Active Today</h4>
              <p className="stat-number">{leaderboard.filter(p => p.streak > 0).length}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}