import { useState, useEffect } from "react";
import { auth, db } from "../firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc,
  increment,
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BlocklyEditor from "../components/BlocklyEditor";
import "../styles/dashboard.css";
import "../styles/codelab.css";

const languages = [
  { id: "javascript", name: "JavaScript", icon: "⚡", supportsBlockly: true },
  { id: "python", name: "Python", icon: "🐍", supportsBlockly: false },
];

const starterTemplates = {
  javascript: {
    basic: `// Welcome to JavaScript!\nconsole.log("Hello, Wizard!");`,
    variables: `let name = "Wizard";\nlet age = 10;\nlet isMagic = true;\n\nconsole.log("Name:", name);\nconsole.log("Age:", age);\nconsole.log("Is Magic:", isMagic);`,
    functions: `function greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("Merlin"));`,
    loops: `for (let i = 1; i <= 5; i++) {\n  console.log("Count:", i);\n}`
  },
  python: {
    basic: `# Welcome to Python!\nprint("Hello, Wizard!")`,
    variables: `name = "Wizard"\nage = 10\nis_magic = True\n\nprint("Name:", name)\nprint("Age:", age)\nprint("Is Magic:", is_magic)`,
    functions: `def greet(name):\n    return "Hello, " + name + "!"\n\nprint(greet("Merlin"))`
  }
};

export default function CodeLab() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [editorMode, setEditorMode] = useState("text"); // "text" or "blockly"
  const [template, setTemplate] = useState("basic");
  const [isRunning, setIsRunning] = useState(false);
  const [currentQuest, setCurrentQuest] = useState(null);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
        if (location.state?.questId) {
          await fetchQuest(currentUser.uid, location.state.questId);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    // Load starter template
    setCode(starterTemplates[language]?.[template] || starterTemplates.javascript.basic);

    return () => unsubscribe();
  }, [language, template, location, navigate]);

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchQuest = async (userId, questId) => {
    try {
      const questDoc = await getDoc(doc(db, "users", userId, "quests", questId));
      if (questDoc.exists()) {
        setCurrentQuest({ id: questId, ...questDoc.data() });
        if (questDoc.data().codeTemplate) {
          setCode(questDoc.data().codeTemplate);
        }
      }
    } catch (error) {
      console.error("Error fetching quest:", error);
    }
  };

  const runCode = async () => {
    if (!user) {
      alert("Please log in to run code!");
      navigate("/login");
      return;
    }

    if (!code.trim()) {
      alert("Please write some code first!");
      return;
    }

    setIsRunning(true);
    setOutput("Running your code... ⏳");

    try {
      // Use local backend server
      const response = await fetch('http://localhost:5000/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language
        })
      });

      const result = await response.json();

      if (!result.success) {
        setOutput(`❌ ${result.output}`);
      } else {
        // Save activity and award XP
        const activityId = Date.now().toString();
        
        await setDoc(doc(db, "users", user.uid, "activities", activityId), {
          type: "code_run",
          title: `Ran ${language} code in Code Lab`,
          xp: 10,
          language: language,
          timestamp: new Date(),
          success: true
        });

        // Update user XP
        await updateDoc(doc(db, "users", user.uid), {
          xp: increment(10),
          lastActive: new Date()
        });

        // Update quest progress if applicable
        if (currentQuest) {
          const newProgress = Math.min((currentQuest.progress || 0) + 10, 100);
          
          await updateDoc(doc(db, "users", user.uid, "quests", currentQuest.id), {
            progress: newProgress
          });

          if (newProgress === 100) {
            // Complete the quest
            await updateDoc(doc(db, "users", user.uid, "quests", currentQuest.id), {
              status: "completed",
              completedAt: new Date()
            });

            const questXP = currentQuest.xpReward || 100;
            await updateDoc(doc(db, "users", user.uid), {
              xp: increment(questXP),
              completedQuests: increment(1)
            });

            await setDoc(doc(db, "users", user.uid, "activities", (Date.now() + 1).toString()), {
              type: "quest_completed",
              title: `Completed "${currentQuest.title}"`,
              xp: questXP,
              timestamp: new Date()
            });

            result.output += `\n\n🎉 Quest Completed! +${questXP} XP`;
          }
        }

        result.output += `\n\n✅ +10 XP for running code!`;
        setOutput(result.output);
      }
      
    } catch (error) {
      console.error("Error running code:", error);
      setOutput(`❌ Error: Unable to execute code. Please make sure the backend server is running.\n\n${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const saveCode = async () => {
    if (!user) {
      alert("Please log in to save code!");
      return;
    }

    try {
      const saveId = Date.now().toString();
      await setDoc(doc(db, "users", user.uid, "savedCode", saveId), {
        code: code,
        language: language,
        template: template,
        editorMode: editorMode,
        timestamp: new Date(),
        name: `Saved Code ${new Date().toLocaleTimeString()}`
      });
      alert("Code saved successfully! ✨");
    } catch (error) {
      console.error("Error saving code:", error);
      alert("Error saving code!");
    }
  };

  const loadTemplate = (lang, temp) => {
    setLanguage(lang);
    setTemplate(temp);
    const templateCode = starterTemplates[lang]?.[temp];
    if (templateCode) {
      setCode(templateCode);
    }
    // Switch to text editor for templates
    setEditorMode("text");
  };

  const handleBlocklyCodeChange = (newCode) => {
    setCode(newCode);
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Code Lab...</p>
        </main>
      </div>
    );
  }

  const currentLanguage = languages.find(lang => lang.id === language);

  return (
    <div className="layout">
      <Sidebar />
      <main className="codelab-main">
        {/* Header */}
        <div className="codelab-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1>💻 Code Lab</h1>
          <div className="header-actions">
            <span className="user-info-small">
              {userData?.username || "Coder"} • {userData?.xp || 0} XP
            </span>
          </div>
        </div>

        {/* Quest Info Bar */}
        {currentQuest && (
          <div className="quest-info-bar">
            <div className="quest-info-content">
              <h3>Current Quest: {currentQuest.title}</h3>
              <p>{currentQuest.description}</p>
              <div className="quest-progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${currentQuest.progress || 0}%` }}
                />
                <span>{currentQuest.progress || 0}% Complete</span>
              </div>
            </div>
            <div className="quest-rewards">
              <span className="reward-badge">⭐ {currentQuest.xpReward || 100} XP</span>
              <span className="reward-badge">🎯 {currentQuest.difficulty || "Beginner"}</span>
            </div>
          </div>
        )}

        {/* Language Selector */}
        <div className="language-selector-bar">
          {languages.map(lang => (
            <button
              key={lang.id}
              className={`lang-select-btn ${language === lang.id ? "active" : ""}`}
              onClick={() => {
                setLanguage(lang.id);
                setTemplate("basic");
                if (!lang.supportsBlockly) {
                  setEditorMode("text");
                }
              }}
            >
              {lang.icon} {lang.name}
            </button>
          ))}
        </div>

        {/* Editor Mode Toggle */}
        {currentLanguage?.supportsBlockly && (
          <div className="editor-mode-toggle">
            <button
              className={`mode-btn ${editorMode === "text" ? "active" : ""}`}
              onClick={() => setEditorMode("text")}
            >
              📝 Text Editor
            </button>
            <button
              className={`mode-btn ${editorMode === "blockly" ? "active" : ""}`}
              onClick={() => setEditorMode("blockly")}
            >
              🧩 Blockly Editor
            </button>
          </div>
        )}

        {/* Template Selector */}
        <div className="template-selector-bar">
          <h4>Start with a template:</h4>
          <div className="template-buttons">
            {Object.keys(starterTemplates[language] || {}).map(temp => (
              <button
                key={temp}
                className={`template-btn ${template === temp ? "active" : ""}`}
                onClick={() => loadTemplate(language, temp)}
              >
                {temp.charAt(0).toUpperCase() + temp.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="codelab-container">
          {/* Editor Panel */}
          <div className="editor-panel">
            <div className="editor-header">
              <div className="editor-info">
                <h3>
                  {editorMode === "blockly" ? "🧩 Blockly Editor" : "📝 Code Editor"}
                  <span className="language-badge">{currentLanguage?.name}</span>
                </h3>
              </div>
              <div className="editor-actions">
                <button className="action-btn" onClick={saveCode}>
                  💾 Save
                </button>
                <button 
                  className="run-btn" 
                  onClick={runCode}
                  disabled={isRunning}
                >
                  {isRunning ? "Running..." : "▶️ Run Code"}
                </button>
              </div>
            </div>

            <div className="editor-content">
              {editorMode === "blockly" ? (
                <BlocklyEditor 
                  onCodeChange={handleBlocklyCodeChange}
                  initialCode={code}
                />
              ) : (
                <textarea
                  className="code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Write your ${language} code here...`}
                  spellCheck="false"
                  rows={15}
                />
              )}
            </div>
          </div>

          {/* Output Panel */}
          <div className="output-panel">
            <div className="output-header">
              <h3>📤 Output</h3>
              <button 
                className="clear-btn"
                onClick={() => setOutput("")}
              >
                Clear
              </button>
            </div>
            <pre className="output-content">
              {output || "Run your code to see the output here..."}
            </pre>
            
            {/* Tips Section */}
            <div className="tips-section">
              <h4>💡 Tips for Young Coders:</h4>
              <ul>
                <li>Always save your work before running</li>
                <li>Start with simple code and make it more complex</li>
                <li>Use comments (// in JavaScript) to explain your code</li>
                <li>Don't worry about errors - they're learning opportunities!</li>
                <li>Complete quests to earn more XP and unlock new worlds</li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button 
                className="action-btn"
                onClick={() => {
                  const templateCode = starterTemplates[language]?.[template] || "";
                  setCode(templateCode);
                }}
              >
                🔄 Reset Code
              </button>
              <button 
                className="action-btn"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                📋 Copy Code
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate("/mentor")}
              >
                🤖 Ask Mentor
              </button>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="examples-section">
          <h3>Try These Examples:</h3>
          <div className="examples-grid">
            <div className="example-card">
              <h4>Simple Calculator</h4>
              <pre>{`let a = 10;\nlet b = 5;\nconsole.log("Sum:", a + b);\nconsole.log("Difference:", a - b);`}</pre>
              <button 
                className="try-btn"
                onClick={() => {
                  setCode(`let a = 10;\nlet b = 5;\nconsole.log("Sum:", a + b);\nconsole.log("Difference:", a - b);`);
                  setEditorMode("text");
                }}
              >
                Try This
              </button>
            </div>
            <div className="example-card">
              <h4>Greeting Generator</h4>
              <pre>{`function greet(name) {\n  return "Hello, " + name + "!";\n}\nconsole.log(greet("Wizard"));`}</pre>
              <button 
                className="try-btn"
                onClick={() => {
                  setCode(`function greet(name) {\n  return "Hello, " + name + "!";\n}\nconsole.log(greet("Wizard"));`);
                  setEditorMode("text");
                }}
              >
                Try This
              </button>
            </div>
            <div className="example-card">
              <h4>Magic Loop</h4>
              <pre>{`for(let i = 1; i <= 5; i++) {\n  console.log("Spell #" + i);\n}`}</pre>
              <button 
                className="try-btn"
                onClick={() => {
                  setCode(`for(let i = 1; i <= 5; i++) {\n  console.log("Spell #" + i);\n}`);
                  setEditorMode("text");
                }}
              >
                Try This
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}