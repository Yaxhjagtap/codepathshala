import { useNavigate } from "react-router-dom";

export default function QuestCard({ quest, onStart }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (quest.status !== "locked") {
      if (onStart) {
        onStart(quest.id);
      } else {
        navigate("/code", { state: { questId: quest.id } });
      }
    }
  };

  return (
    <div 
      className={`quest-card ${quest.status}`}
      onClick={handleClick}
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
          {quest.progress > 0 && (
            <span className="quest-progress">{quest.progress}%</span>
          )}
        </div>
      </div>
      <div className="quest-status">
        {quest.status === "completed" ? "Completed" :
         quest.status === "in-progress" ? "Continue →" :
         quest.status === "available" ? "Start" : "Locked"}
      </div>
    </div>
  );
}