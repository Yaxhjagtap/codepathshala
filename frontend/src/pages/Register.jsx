import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const avatars = ["🧙‍♂️", "🧑‍🚀", "🧝‍♀️", "🤖", "🦊", "🐉", "🦄", "🐱"];
const ageGroups = [
  { value: "6-8", label: "6-8 years", icon: "👶", color: "#FFB6C1" },
  { value: "9-11", label: "9-11 years", icon: "🧒", color: "#87CEEB" },
  { value: "12-14", label: "12-14 years", icon: "🧑", color: "#98FB98" },
  { value: "15-16", label: "15-16 years", icon: "👨", color: "#DDA0DD" },
];

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [ageGroup, setAgeGroup] = useState("");
  const [step, setStep] = useState(1); // 1: Basic info, 2: Age selection
  const navigate = useNavigate();

  // Age-based quest syllabus
  const getAgeBasedQuests = (age) => {
    const syllabus = {
      "6-8": [
        {
          id: "basic_variables",
          title: "Magic Boxes (Variables)",
          description: "Learn to store things in magic boxes",
          difficulty: "beginner",
          xpReward: 100,
          world: "Magic Forest",
          codeTemplate: `let magicBox = "treasure";\nprint(magicBox);`,
          concepts: ["variables", "strings"]
        },
        {
          id: "simple_math",
          title: "Counting Spells",
          description: "Learn basic math with magic",
          difficulty: "beginner",
          xpReward: 120,
          world: "Magic Forest",
          codeTemplate: `let apples = 3;\nlet oranges = 4;\nlet total = apples + oranges;\nprint(total);`,
          concepts: ["numbers", "addition"]
        }
      ],
      "9-11": [
        {
          id: "variables_types",
          title: "Data Types Adventure",
          description: "Learn about different types of data",
          difficulty: "intermediate",
          xpReward: 150,
          world: "Magic Forest",
          codeTemplate: `let name = "Wizard"; // string\nlet age = 10; // number\nlet isMagic = true; // boolean\nprint(name);`,
          concepts: ["variables", "data types"]
        },
        {
          id: "conditionals",
          title: "Decision Making",
          description: "Learn if-else statements",
          difficulty: "intermediate",
          xpReward: 200,
          world: "Magic Forest",
          codeTemplate: `let score = 85;\nif(score > 80) {\n  print("Great job!");\n} else {\n  print("Try again!");\n}`,
          concepts: ["conditionals", "comparison"]
        }
      ],
      "12-14": [
        {
          id: "functions_intro",
          title: "Magic Functions",
          description: "Create reusable magic spells",
          difficulty: "advanced",
          xpReward: 250,
          world: "Magic Forest",
          codeTemplate: `function castSpell() {\n  print("Abracadabra!");\n}\ncastSpell();`,
          concepts: ["functions", "calling"]
        },
        {
          id: "loops",
          title: "Looping Magic",
          description: "Repeat actions with loops",
          difficulty: "advanced",
          xpReward: 300,
          world: "Magic Forest",
          codeTemplate: `for(let i = 0; i < 5; i++) {\n  print("Spell " + i);\n}`,
          concepts: ["loops", "iteration"]
        }
      ],
      "15-16": [
        {
          id: "arrays",
          title: "Collections of Magic",
          description: "Store multiple items in arrays",
          difficulty: "expert",
          xpReward: 400,
          world: "Robot City",
          codeTemplate: `let spells = ["Fire", "Water", "Earth", "Air"];\nfor(let spell of spells) {\n  print(spell);\n}`,
          concepts: ["arrays", "loops"]
        },
        {
          id: "objects",
          title: "Wizard Objects",
          description: "Create complex data structures",
          difficulty: "expert",
          xpReward: 500,
          world: "Robot City",
          codeTemplate: `let wizard = {\n  name: "Merlin",\n  age: 150,\n  power: "Teleportation"\n};\nprint(wizard.name);`,
          concepts: ["objects", "properties"]
        }
      ]
    };
    return syllabus[age] || syllabus["9-11"];
  };

  const register = async () => {
    try {
      if (!ageGroup) {
        alert("Please select your age group!");
        return;
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get age-based quests
      const ageQuests = getAgeBasedQuests(ageGroup);

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        username: username,
        avatar: avatar,
        ageGroup: ageGroup,
        xp: 0,
        level: 1,
        completedQuests: 0,
        totalQuests: ageQuests.length,
        streak: 0,
        accuracy: 0,
        unlockedWorlds: ["Magic Forest"],
        currentQuest: ageQuests[0]?.id || "basic_variables",
        createdAt: new Date(),
        lastLogin: new Date()
      });

      // Create initial quests based on age
      for (let i = 0; i < ageQuests.length; i++) {
        const quest = ageQuests[i];
        await setDoc(doc(db, "users", user.uid, "quests", quest.id), {
          ...quest,
          status: i === 0 ? "available" : "locked",
          progress: 0,
          order: i + 1,
          createdAt: new Date()
        });
      }

      // Create initial leaderboard entry
      await setDoc(doc(db, "leaderboard", user.uid), {
        uid: user.uid,
        username: username,
        avatar: avatar,
        xp: 0,
        level: 1,
        ageGroup: ageGroup
      });

      alert("Account created successfully! ✨");
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const renderStep1 = () => (
    <>
      <h2 className="auth-title">Join the Adventure!</h2>
      <p className="auth-subtitle">
        Create your Little Wizard account
      </p>

      <p className="text-sm mb-2 font-medium">Choose Your Avatar</p>
      <div className="avatar-grid">
        {avatars.map((a) => (
          <div
            key={a}
            className={`avatar ${avatar === a ? "selected" : ""}`}
            onClick={() => setAvatar(a)}
          >
            {a}
          </div>
        ))}
      </div>

      <input
        className="auth-input"
        placeholder="Choose a cool username"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
      />

      <input
        className="auth-input"
        type="email"
        placeholder="Parent's email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />

      <input
        type="password"
        className="auth-input"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />

      <button 
        className="auth-btn" 
        onClick={() => {
          if (username && email && password) {
            setStep(2);
          } else {
            alert("Please fill in all fields!");
          }
        }}
      >
        Next: Select Age →
      </button>

      <div className="auth-switch">
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Log in</span>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <h2 className="auth-title">Select Your Age Group</h2>
      <p className="auth-subtitle">
        We'll customize your learning journey based on your age
      </p>

      <div className="age-grid">
        {ageGroups.map((age) => (
          <div
            key={age.value}
            className={`age-card ${ageGroup === age.value ? "selected" : ""}`}
            onClick={() => setAgeGroup(age.value)}
            style={{ borderColor: age.color }}
          >
            <div className="age-icon" style={{ backgroundColor: age.color }}>
              {age.icon}
            </div>
            <div className="age-info">
              <h4>{age.label}</h4>
              <p className="age-desc">
                {age.value === "6-8" ? "Basic concepts with games" :
                 age.value === "9-11" ? "Interactive coding adventures" :
                 age.value === "12-14" ? "Real programming concepts" :
                 "Advanced coding challenges"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="age-preview">
        <h4>What you'll learn:</h4>
        <ul>
          {ageGroup && getAgeBasedQuests(ageGroup).map((quest, idx) => (
            <li key={idx}>
              <span className="quest-bullet">✨</span>
              {quest.title}
            </li>
          ))}
        </ul>
      </div>

      <button 
        className="auth-btn" 
        onClick={register}
        disabled={!ageGroup}
      >
        Create Account ✨
      </button>

      <button 
        className="secondary-btn"
        onClick={() => setStep(1)}
      >
        ← Back
      </button>
    </>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-back" onClick={() => navigate("/")}>
          ← Back to Home
        </div>

        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
}