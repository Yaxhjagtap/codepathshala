import { useState, useEffect } from "react";
import { auth, db } from "../firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  increment
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import XPBar from "../components/XPBar";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [quests, setQuests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchAllUserData(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchAllUserData = async (userId) => {
    // 1. Fetch User Data
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserData(data);
        await updateStreak(userId, data);
      }
    } catch (error) {
      console.error("Error fetching user document:", error);
    }

    // 2. Fetch Quests
    try {
      const questsQuery = query(
        collection(db, "users", userId, "quests"),
        orderBy("order")
      );
      const questsSnapshot = await getDocs(questsQuery);
      const questsData = questsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuests(questsData);
    } catch (error) {
      console.error("Error fetching quests:", error);
    }

    // 3. Fetch Activities
    try {
      const activitiesQuery = query(
        collection(db, "users", userId, "activities"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activitiesData = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }

    // 4. Fetch Leaderboard
    try {
      const usersQuery = query(
        collection(db, "users"),
        orderBy("xp", "desc"),
        limit(10)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaderboard(usersData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const updateStreak = async (userId, userData) => {
    try {
      const now = new Date();
      const lastLogin = userData.lastLogin?.toDate() || now;
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      
      const diffTime = Math.abs(today - lastLoginDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreak = userData.streak || 0;
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      
      await updateDoc(doc(db, "users", userId), {
        streak: newStreak,
        lastLogin: now
      });
      
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  const startQuest = async (questId) => {
    if (!user) return;
    
    try {
      const questRef = doc(db, "users", user.uid, "quests", questId);
      await updateDoc(questRef, {
        status: "in-progress",
        startedAt: new Date()
      });
      
      await fetchAllUserData(user.uid);
      navigate("/code", { state: { questId } });
    } catch (error) {
      console.error("Error starting quest:", error);
      alert("Error starting quest. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const calculateAccuracy = () => {
    if (!quests.length) return 0;
    const completed = quests.filter(q => q.status === "completed").length;
    const attempted = quests.filter(q => q.progress > 0).length;
    return attempted > 0 ? Math.round((completed / attempted) * 100) : 0;
  };

  const calculateTotalXPForLevel = (level) => {
    return level * 1000;
  };

  const getCurrentQuest = () => {
    const inProgress = quests.find(q => q.status === "in-progress");
    if (inProgress) return inProgress;
    
    const available = quests.find(q => q.status === "available");
    if (available) return available;
    
    return null;
  };

  const getAgeGroupLabel = (ageGroup) => {
    switch(ageGroup) {
      case "6-8": return "Ages 6-8";
      case "9-11": return "Ages 9-11";
      case "12-14": return "Ages 12-14";
      case "15-16": return "Ages 15-16";
      default: return "Young Coder";
    }
  };

  const getAgeBasedMessage = (ageGroup) => {
    switch(ageGroup) {
      case "6-8": return "Let's learn coding through fun games!";
      case "9-11": return "Ready for some exciting coding adventures?";
      case "12-14": return "Time to level up your programming skills!";
      case "15-16": return "Master advanced concepts and build amazing projects!";
      default: return "Continue your coding journey!";
    }
  };

  const getNextWorldToUnlock = () => {
    const worlds = [
      { id: "magic_forest", name: "Magic Forest", unlockXP: 0 },
      { id: "robot_city", name: "Robot City", unlockXP: 500 },
      { id: "space_station", name: "Space Station", unlockXP: 1500 },
      { id: "dragon_castle", name: "Dragon Castle", unlockXP: 3000 }
    ];
    
    const userXP = userData?.xp || 0;
    const unlockedWorlds = userData?.unlockedWorlds || ["magic_forest"];
    
    return worlds.find(world => 
      !unlockedWorlds.includes(world.id) && world.unlockXP > userXP
    );
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your adventure...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="layout">
        <Sidebar />
        <main>
          <div className="auth-required">
            <h2>Welcome to CodePathshala! 🧙‍♂️</h2>
            <p>Please log in to continue your coding adventure</p>
            <button 
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuest = getCurrentQuest();
  const accuracy = calculateAccuracy();
  const nextWorld = getNextWorldToUnlock();

  return (
    <div className="layout">
      <Sidebar />
      
      <main>
        <div className="user-header">
          <div className="user-avatar-large">
            <span className="avatar-emoji">
              {userData?.avatar || "🧙‍♂️"}
            </span>
          </div>
          <div className="user-info">
            <h1>Welcome back, {userData?.username || "Adventurer"}!</h1>
            <p className="user-email">{user?.email}</p>
            <div className="user-meta">
              <span className="user-tag">
                ⭐ Wizard Level {userData?.level || 1}
              </span>
              <span className="age-badge">
                {getAgeGroupLabel(userData?.ageGroup)}
              </span>
              <span className="streak-badge">
                🔥 {userData?.streak || 0} day streak
              </span>
            </div>
            <p className="welcome-message">
              {getAgeBasedMessage(userData?.ageGroup)}
            </p>
          </div>
          <div className="header-actions" style={{ marginLeft: "auto" }}>
            <button 
              className="secondary-btn" 
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <XPBar 
          current={userData?.xp || 0} 
          total={calculateTotalXPForLevel(userData?.level || 1)}
          level={userData?.level || 1}
        />

        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate("/quests")}>
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>Quests Completed</h3>
              <p className="stat-value">
                {userData?.completedQuests || 0}
                <span className="stat-total">/{userData?.totalQuests || 5}</span>
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>Current Streak</h3>
              <p className="stat-value">{userData?.streak || 0} days</p>
              <p className="stat-hint">
                {userData?.streak >= 7 ? "🔥 Amazing!" : 
                 userData?.streak >= 3 ? "Keep it up!" : "Start your streak!"}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>Total XP</h3>
              <p className="stat-value">{userData?.xp?.toLocaleString() || 0}</p>
              <p className="stat-hint">Earn XP by completing quests</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Accuracy</h3>
              <p className="stat-value">{accuracy}%</p>
              <p className="stat-hint">
                {accuracy >= 90 ? "Excellent!" : 
                 accuracy >= 70 ? "Good job!" : "Keep practicing!"}
              </p>
            </div>
          </div>
        </div>

        {nextWorld && (
          <div className="world-unlock-card">
            <div className="world-unlock-info">
              <h3>🔒 Next World: {nextWorld.name}</h3>
              <p>Unlock at {nextWorld.unlockXP} XP</p>
              <div className="world-progress">
                <div 
                  className="world-progress-bar"
                  style={{ 
                    width: `${Math.min(((userData?.xp || 0) / nextWorld.unlockXP) * 100, 100)}%` 
                  }}
                />
              </div>
              <p className="world-xp-needed">
                You need {nextWorld.unlockXP - (userData?.xp || 0)} more XP to unlock
              </p>
            </div>
            <button 
              className="primary-btn small"
              onClick={() => navigate("/quests")}
            >
              Earn XP →
            </button>
          </div>
        )}

        {currentQuest ? (
          <section className="card">
            <div className="quest-header">
              <h3>Current Quest</h3>
              <span className={`quest-badge ${currentQuest.status}`}>
                {currentQuest.status === "in-progress" ? "In Progress" : "Available"}
              </span>
            </div>
            <p className="quest-title">{currentQuest.title}</p>
            <p className="quest-description">{currentQuest.description}</p>
            
            <div className="progress-container">
              <div className="progress-label">
                <span>Progress</span>
                <span>{currentQuest.progress || 0}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{ width: `${currentQuest.progress || 0}%` }}
                />
              </div>
            </div>
            
            <div className="quest-rewards">
              <span className="reward-tag">🎯 {currentQuest.xpReward || 100} XP</span>
              <span className="reward-tag">⭐ {currentQuest.difficulty || "Beginner"}</span>
              <span className="reward-tag">🌍 {currentQuest.world || "Magic Forest"}</span>
            </div>
            
            <button 
              className="primary-btn"
              onClick={() => startQuest(currentQuest.id)}
            >
              {currentQuest.status === "in-progress" ? "Continue Quest →" : "Start Quest →"}
            </button>
          </section>
        ) : (
          <section className="card">
            <div className="quest-header">
              <h3>🎉 All Quests Completed!</h3>
            </div>
            <p className="quest-title">You've completed all available quests!</p>
            <p className="quest-description">
              Great job! You've mastered all the concepts in your current world.
              {nextWorld ? ` Keep earning XP to unlock ${nextWorld.name}!` : " You're a coding master!"}
            </p>
            <button 
              className="primary-btn"
              onClick={() => navigate("/quests")}
            >
              View Quest Map →
            </button>
          </section>
        )}

        <section className="card">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <button 
              className="view-all-btn"
              onClick={() => alert("View all activity feature coming soon!")}
            >
              View All
            </button>
          </div>
          <div className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <span className="activity-icon">
                    {activity.type === "quest_completed" ? "✅" : 
                     activity.type === "code_run" ? "💻" : 
                     activity.type === "level_up" ? "⬆️" : 
                     activity.type === "login" ? "👋" : "🎮"}
                  </span>
                  <div className="activity-content">
                    <p className="activity-title">{activity.title || "Completed activity"}</p>
                    <span className="activity-time">
                      {activity.xp ? <span className="xp-earned">+{activity.xp} XP</span> : ""}
                      <span className="activity-date">
                        {activity.timestamp?.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) || "Recently"}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-activity">
                <span className="empty-icon">📝</span>
                <div className="empty-content">
                  <p>No activity yet</p>
                  <p className="empty-hint">Complete quests to see your activity here</p>
                </div>
                <button 
                  className="primary-btn small"
                  onClick={() => navigate("/quests")}
                >
                  Start Quest
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <h3>🏆 Leaderboard Top 3</h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate("/leaderboard")}
            >
              View Full
            </button>
          </div>
          <div className="leaderboard-preview">
            {leaderboard.length > 0 ? (
              leaderboard.slice(0, 3).map((player, index) => (
                <div 
                  key={player.id} 
                  className={`leaderboard-item ${player.id === user.uid ? "current-user" : ""}`}
                  onClick={() => player.id === user.uid ? navigate("/avatar") : null}
                >
                  <div className="leaderboard-rank">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className="leaderboard-avatar">
                    {player.avatar || "🧙‍♂️"}
                  </div>
                  <div className="leaderboard-info">
                    <strong>{player.username || "Player"}</strong>
                    <div className="leaderboard-meta">
                      <span>Level {player.level || 1}</span>
                      <span className="leaderboard-age">
                        {getAgeGroupLabel(player.ageGroup)}
                      </span>
                    </div>
                  </div>
                  <div className="leaderboard-xp">
                    {player.xp?.toLocaleString() || 0} XP
                  </div>
                </div>
              ))
            ) : (
              <p>Leaderboard loading or unavailable.</p>
            )}
          </div>
          
          {leaderboard.findIndex(p => p.id === user.uid) >= 3 && (
            <div className="user-position">
              <div className="position-info">
                <span>Your position:</span>
                <strong>#{leaderboard.findIndex(p => p.id === user.uid) + 1}</strong>
                <span>with {userData?.xp || 0} XP</span>
              </div>
            </div>
          )}
        </section>

        <div className="quick-actions">
          <button 
            className="action-btn"
            onClick={() => navigate("/code")}
          >
            <span className="action-icon">💻</span>
            <div className="action-content">
              <strong>Code Lab</strong>
              <span>Practice coding</span>
            </div>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate("/quests")}
          >
            <span className="action-icon">🗺️</span>
            <div className="action-content">
              <strong>Quest Map</strong>
              <span>Explore new quests</span>
            </div>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate("/mentor")}
          >
            <span className="action-icon">🤖</span>
            <div className="action-content">
              <strong>AI Mentor</strong>
              <span>Ask questions</span>
            </div>
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate("/avatar")}
          >
            <span className="action-icon">👤</span>
            <div className="action-content">
              <strong>My Avatar</strong>
              <span>Customize character</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}