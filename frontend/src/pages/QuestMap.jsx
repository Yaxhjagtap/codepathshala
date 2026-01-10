const worlds = [
  { name: "Magic Forest", unlocked: true },
  { name: "Robot City", unlocked: true },
  { name: "Space Station", unlocked: false },
];

export default function QuestMap() {
  return (
    <div>
      <h2>Quest Map</h2>
      {worlds.map(w => (
        <div key={w.name}>
          {w.name} {w.unlocked ? "✅" : "🔒"}
        </div>
      ))}
    </div>
  );
}
