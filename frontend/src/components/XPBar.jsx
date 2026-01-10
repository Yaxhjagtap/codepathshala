export default function XPBar({
  current = 0,
  total = 1000,
  level = 1
}) {
  const percentage = Math.min(
    Math.round((current / total) * 100),
    100
  );

  return (
    <div className="xp-card">
      <div className="xp-header">
        <span className="xp-level">Level {level}</span>
        <span className="xp-text">
          {current} / {total} XP
        </span>
      </div>

      <div className="xp-track">
        <div
          className="xp-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
