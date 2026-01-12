import { useState, useEffect } from "react";
import { auth, db } from "../firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  orderBy,
  updateDoc 
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import "../styles/questmap.css";

const worlds = [
  { 
    id: "magic_forest", 
    name: "Magic Forest", 
    color: "#4CAF50",
    icon: "🌳",
    description: "Learn programming basics through magical adventures",
    unlockXP: 0
  },
  { 
    id: "robot_city", 
    name: "Robot City", 
    color: "#2196F3",
    icon: "🤖",
    description: "Build and program robots with functions and logic",
    unlockXP: 500
  },
  { 
    id: "space_station", 
    name: "Space Station", 
    color: "#9C27B0",
    icon: "🚀",
    description: "Master advanced concepts in zero gravity",
    unlockXP: 1500
  },
  { 
    id: "dragon_castle", 
    name: "Dragon Castle", 
    color: "#FF9800",
    icon: "🐉",
    description: "Solve challenging puzzles and algorithms",
    unlockXP: 3000
  }
];

export default function QuestMap() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [quests, setQuests] = useState([]);
  const [selectedWorld, setSelectedWorld] = useState("magic_forest");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      // Fetch user document
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserData(data);

        // Fetch quests for user
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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const unlockWorld = async (worldId) => {
    if (!user || !userData) return;
    
    const world = worlds.find(w => w.id === worldId);
    if (userData.xp >= world.unlockXP) {
      try {
        // Add world to unlocked worlds
        const unlockedWorlds = [...(userData.unlockedWorlds || []), worldId];
        await updateDoc(doc(db, "users", user.uid), {
          unlockedWorlds: unlockedWorlds
        });
        
        // Add quests for the new world
        const newQuests = getWorldQuests(worldId, userData.ageGroup);
        for (const quest of newQuests) {
          await updateDoc(doc(db, "users", user.uid, "quests", quest.id), {
            ...quest,
            status: "available",
            createdAt: new Date()
          }, { merge: true });
        }
        
        setSelectedWorld(worldId);
        await fetchUserData(user.uid);
        alert(`Congratulations! You unlocked ${world.name}! 🎉`);
      } catch (error) {
        console.error("Error unlocking world:", error);
      }
    } else {
      alert(`You need ${world.unlockXP} XP to unlock ${world.name}. You have ${userData.xp} XP.`);
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
      
      navigate("/code", { state: { questId } });
    } catch (error) {
      console.error("Error starting quest:", error);
    }
  };

  const getWorldQuests = (worldId, ageGroup) => {
    const questsByWorld = {
      "magic_forest": [
        {
          id: `${worldId}_variables`,
          title: "Magic Variables",
          description: "Store magical items in variables",
          xpReward: 100,
          difficulty: "beginner",
          order: 1,
          world: worldId
        },
        {
          id: `${worldId}_conditionals`,
          title: "Decision Paths",
          description: "Choose paths with if-else statements",
          xpReward: 150,
          difficulty: "beginner",
          order: 2,
          world: worldId
        }
      ],
      "robot_city": [
        {
          id: `${worldId}_functions`,
          title: "Robot Functions",
          description: "Create reusable robot commands",
          xpReward: 200,
          difficulty: "intermediate",
          order: 1,
          world: worldId
        },
        {
          id: `${worldId}_loops`,
          title: "Looping Robots",
          description: "Make robots repeat actions",
          xpReward: 250,
          difficulty: "intermediate",
          order: 2,
          world: worldId
        }
      ],
      "space_station": [
        {
          id: `${worldId}_arrays`,
          title: "Star Arrays",
          description: "Organize stars in arrays",
          xpReward: 300,
          difficulty: "advanced",
          order: 1,
          world: worldId
        },
        {
          id: `${worldId}_objects`,
          title: "Space Objects",
          description: "Create complex space objects",
          xpReward: 350,
          difficulty: "advanced",
          order: 2,
          world: worldId
        }
      ],
      "dragon_castle": [
        {
          id: `${worldId}_algorithms`,
          title: "Dragon Algorithms",
          description: "Solve dragon puzzles",
          xpReward: 400,
          difficulty: "expert",
          order: 1,
          world: worldId
        },
        {
          id: `${worldId}_challenges`,
          title: "Final Challenge",
          description: "Master all concepts",
          xpReward: 500,
          difficulty: "expert",
          order: 2,
          world: worldId
        }
      ]
    };
    
    return questsByWorld[worldId] || [];
  };

  const isWorldUnlocked = (world) => {
    if (!userData) return false;
    return userData.xp >= world.unlockXP || 
           userData.unlockedWorlds?.includes(world.id);
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quest map...</p>
        </main>
      </div>
    );
  }

  const worldQuests = quests.filter(q => q.world === selectedWorld);
  const selectedWorldData = worlds.find(w => w.id === selectedWorld);

  return (
    <div className="layout">
      <Sidebar />
      <main className="quest-map-main">
        <div className="quest-map-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1>🗺️ Quest Map</h1>
          <div className="header-stats">
            <span className="xp-badge">⭐ {userData?.xp || 0} XP</span>
            <span className="level-badge">Level {userData?.level || 1}</span>
          </div>
        </div>

        <div className="world-selector">
          {worlds.map((world) => {
            const unlocked = isWorldUnlocked(world);
            return (
              <div
                key={world.id}
                className={`world-card ${selectedWorld === world.id ? "selected" : ""} ${
                  unlocked ? "unlocked" : "locked"
                }`}
                onClick={() => unlocked && setSelectedWorld(world.id)}
                style={{ 
                  borderColor: world.color,
                  opacity: unlocked ? 1 : 0.6
                }}
              >
                <div className="world-icon" style={{ backgroundColor: world.color }}>
                  {world.icon}
                </div>
                <h3>{world.name}</h3>
                <p className="world-xp">
                  {unlocked ? "✅ Unlocked" : `🔒 ${world.unlockXP} XP needed`}
                </p>
                {!unlocked && userData && (
                  <button 
                    className="unlock-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      unlockWorld(world.id);
                    }}
                  >
                    Unlock ({userData.xp}/{world.unlockXP} XP)
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="quest-map-content">
          <div className="world-header" style={{ backgroundColor: selectedWorldData.color }}>
            <h1>{selectedWorldData.name} {selectedWorldData.icon}</h1>
            <p>{selectedWorldData.description}</p>
          </div>

          <div className="quest-path">
            {worldQuests.map((quest, index) => (
              <div key={quest.id} className="quest-node">
                <div className="node-connector"></div>
                <div 
                  className={`quest-card ${quest.status}`}
                  onClick={() => quest.status !== "locked" && startQuest(quest.id)}
                >
                  <div className="quest-icon">
                    {quest.status === "completed" ? "✅" :
                     quest.status === "in-progress" ? "🎯" :
                     quest.status === "available" ? "✨" : "🔒"}
                  </div>
                  <div className="quest-info">
                    <h3>{quest.title}</h3>
                    <p>{quest.description}</p>
                    <div className="quest-meta">
                      <span className="quest-difficulty">{quest.difficulty}</span>
                      <span className="quest-xp">⭐ {quest.xpReward} XP</span>
                      <span className="quest-progress">Progress: {quest.progress || 0}%</span>
                    </div>
                  </div>
                  <div className="quest-status">
                    {quest.status === "completed" ? "Completed" :
                     quest.status === "in-progress" ? "Continue →" :
                     quest.status === "available" ? "Start" : "Locked"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="quest-stats">
            <div className="stat-item">
              <h4>Total Quests</h4>
              <p>{quests.length}</p>
            </div>
            <div className="stat-item">
              <h4>Completed</h4>
              <p>{quests.filter(q => q.status === "completed").length}</p>
            </div>
            <div className="stat-item">
              <h4>In Progress</h4>
              <p>{quests.filter(q => q.status === "in-progress").length}</p>
            </div>
            <div className="stat-item">
              <h4>Available</h4>
              <p>{quests.filter(q => q.status === "available").length}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}