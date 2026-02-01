import { useNavigate } from "react-router-dom";

export default function QuestCard({ quest, onStart, worldColor, canStart }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (canStart) {
      if (onStart) {
        onStart(quest.id);
      } else {
        navigate("/code", { state: { questId: quest.id } });
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "beginner": return "#4CAF50";
      case "intermediate": return "#2196F3";
      case "advanced": return "#9C27B0";
      case "expert": return "#FF9800";
      default: return "#666";
    }
  };

  const getStatusIcon = () => {
    switch(quest.status) {
      case "completed": return "✅";
      case "in-progress": return "🎯";
      case "available": return "✨";
      default: return "🔒";
    }
  };

  const getStatusText = () => {
    switch(quest.status) {
      case "completed": return "Completed";
      case "in-progress": return "Continue →";
      case "available": return "Start Quest";
      default: return "Locked";
    }
  };

  return (
    <div 
      className={`quest-card ${quest.status} ${canStart ? "interactive" : ""}`}
      onClick={handleClick}
      style={{
        borderLeft: `4px solid ${worldColor}`,
        cursor: canStart ? "pointer" : "not-allowed"
      }}
    >
      <div className="quest-card-header">
        <div className="quest-status-indicator">
          {getStatusIcon()}
        </div>
        <div className="quest-main-info">
          <h3>{quest.title}</h3>
          <p className="quest-description">{quest.description}</p>
        </div>
      </div>
      
      <div className="quest-card-body">
        <div className="quest-tags">
          <span 
            className="tag difficulty" 
            style={{ backgroundColor: getDifficultyColor(quest.difficulty) }}
          >
            {quest.difficulty}
          </span>
          <span className="tag duration">
            ⏱️ {quest.estimatedTime || "15-30 min"}
          </span>
          {quest.concepts && quest.concepts.slice(0, 2).map((concept, idx) => (
            <span key={idx} className="tag concept">
              {concept}
            </span>
          ))}
        </div>
        
        <div className="quest-progress-section">
          {quest.status === "in-progress" && quest.progress > 0 && (
            <div className="progress-container">
              <div className="progress-label">
                <span>Progress</span>
                <span>{quest.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${quest.progress}%`,
                    backgroundColor: worldColor
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="quest-card-footer">
        <div className="quest-rewards">
          <span className="reward-xp">⭐ {quest.xpReward} XP</span>
          {quest.badgeReward && (
            <span className="reward-badge">🏅 {quest.badgeReward}</span>
          )}
        </div>
        
        <div className="quest-actions">
          <button 
            className={`quest-action-btn ${quest.status} ${!canStart ? "disabled" : ""}`}
            onClick={handleClick}
            disabled={!canStart}
            style={canStart ? { backgroundColor: worldColor } : {}}
          >
            {getStatusText()}
          </button>
        </div>
      </div>
    </div>
  );
}