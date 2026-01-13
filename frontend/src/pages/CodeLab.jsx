import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase/auth";
import { runCodeInBrowser, runCombinedCode, runPythonOnServer } from "../components/CustomCodeRunner";
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
import PythonBlocklyEditor from "../components/PythonBlocklyEditor";
import CombinedEditor from "../components/CombinedEditor";
import "../styles/dashboard.css";
import "../styles/codelab.css";

const languages = [
  { id: "javascript", name: "JavaScript", icon: "⚡", supportsBlockly: false },
  { id: "html", name: "HTML", icon: "🌐", supportsBlockly: false },
  { id: "css", name: "CSS", icon: "🎨", supportsBlockly: false },
  { id: "python", name: "Python", icon: "🐍", supportsBlockly: true },
  { id: "web", name: "Web (HTML+CSS+JS)", icon: "🌍", supportsBlockly: false }
];

const starterTemplates = {
  javascript: {
    basic: `// Welcome to JavaScript!\nconsole.log("Hello, Wizard!");\n\n// Try changing the message below:\nconsole.log("Coding is fun!");`,
    variables: `// Working with Variables\nlet name = "Wizard";\nlet age = 10;\nlet isMagic = true;\n\nconsole.log("Name:", name);\nconsole.log("Age:", age);\nconsole.log("Is Magic:", isMagic);\n\n// Try changing the values above and run again!`,
    functions: `// Creating Functions\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("Merlin"));\nconsole.log(greet("Gandalf"));\n\n// Create your own function below:`,
    loops: `// Using Loops\nconsole.log("Counting from 1 to 5:");\nfor (let i = 1; i <= 5; i++) {\n  console.log("Count:", i);\n}\n\n// Try making it count to 10!`
  },
  html: {
    basic: `<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Webpage</title>\n</head>\n<body>\n  <h1>Welcome to My Website!</h1>\n  <p>This is my first HTML page.</p>\n  <ul>\n    <li>HTML creates structure</li>\n    <li>CSS adds style</li>\n    <li>JavaScript adds interactivity</li>\n  </ul>\n</body>\n</html>`,
    forms: `<!DOCTYPE html>\n<html>\n<head>\n  <title>Contact Form</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      padding: 20px;\n    }\n    .form-group {\n      margin-bottom: 15px;\n    }\n    label {\n      display: block;\n      margin-bottom: 5px;\n    }\n    input, textarea {\n      width: 100%;\n      padding: 8px;\n      border: 1px solid #ddd;\n      border-radius: 4px;\n    }\n    button {\n      background-color: #6c63ff;\n      color: white;\n      padding: 10px 20px;\n      border: none;\n      border-radius: 4px;\n      cursor: pointer;\n    }\n  </style>\n</head>\n<body>\n  <h1>Contact Us</h1>\n  <form>\n    <div class="form-group">\n      <label for="name">Name:</label>\n      <input type="text" id="name" placeholder="Enter your name">\n    </div>\n    <div class="form-group">\n      <label for="email">Email:</label>\n      <input type="email" id="email" placeholder="Enter your email">\n    </div>\n    <div class="form-group">\n      <label for="message">Message:</label>\n      <textarea id="message" rows="4" placeholder="Your message"></textarea>\n    </div>\n    <button type="submit">Send Message</button>\n  </form>\n</body>\n</html>`
  },
  css: {
    basic: `/* This is a CSS comment */\nbody {\n  background-color: lightblue;\n  font-family: Arial, sans-serif;\n  padding: 20px;\n}\n\nh1 {\n  color: darkblue;\n  text-align: center;\n  border-bottom: 2px solid darkblue;\n  padding-bottom: 10px;\n}\n\np {\n  color: green;\n  font-size: 18px;\n  line-height: 1.6;\n}\n\n.highlight {\n  background-color: yellow;\n  padding: 5px;\n  border-radius: 3px;\n}`,
    animations: `body {\n  background: linear-gradient(45deg, #ff9a9e, #fad0c4);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.box {\n  width: 100px;\n  height: 100px;\n  background-color: #6c63ff;\n  border-radius: 10px;\n  animation: spin 2s infinite, colorChange 3s infinite;\n}\n\n@keyframes spin {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}\n\n@keyframes colorChange {\n  0% { background-color: #6c63ff; }\n  50% { background-color: #ff9f1c; }\n  100% { background-color: #6c63ff; }\n}`
  },
  python: {
    basic: `# Welcome to Python!\nprint("Hello, Wizard!")\n\n# Try changing the message below:\nprint("Learning to code is magical!")`,
    variables: `# Working with variables in Python\nname = "Wizard"\nage = 10\nis_magic = True\n\nprint("Name:", name)\nprint("Age:", age)\nprint("Is Magic:", is_magic)`,
    loops: `# Using loops in Python\nprint("Counting from 1 to 5:")\nfor i in range(1, 6):\n    print("Count:", i)`,
    functions: `# Creating functions in Python\ndef greet(name):\n    return "Hello, " + name + "!"\n\nprint(greet("Merlin"))\nprint(greet("Gandalf"))`,
    conditions: `# If-else conditions in Python\nage = 12\n\nif age < 13:\n    print("You are a child")\nelif age < 20:\n    print("You are a teenager")\nelse:\n    print("You are an adult")`
  },
  web: {
    basic: {
      html: `<div class="container">\n  <h1 id="title">Welcome to My Page!</h1>\n  <p>This is a simple webpage with HTML, CSS, and JavaScript.</p>\n  <button onclick="changeTitle()">Click Me!</button>\n</div>`,
      css: `.container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n  text-align: center;\n}\n\nh1 {\n  color: #6c63ff;\n  font-family: Arial, sans-serif;\n}\n\nbutton {\n  background-color: #6c63ff;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 16px;\n}\n\nbutton:hover {\n  background-color: #554eeb;\n}`,
      js: `function changeTitle() {\n  const title = document.getElementById('title');\n  title.textContent = 'You clicked the button!';\n  title.style.color = '#ff9f1c';\n  \n  console.log('Button clicked! Title changed.');\n}`
    }
  }
};

// Lab completion checkers
const labCheckers = {
  "lab_1": (code) => {
    // Check if contains print statement
    return code.includes('print(') || code.includes('print (');
  },
  "lab_2": (code) => {
    // Check if contains variable assignment
    return (code.includes('=') && (code.includes('let ') || code.includes('var ') || code.includes('const ') || 
            (code.includes(' = ') && !code.includes('=='))));
  },
  "lab_3": (code) => {
    // Check if contains function definition
    return code.includes('function ') || code.includes('def ') || code.includes('() =>');
  },
  "lab_4": (code) => {
    // Check if contains HTML structure
    return code.includes('<!DOCTYPE html>') || code.includes('<html>');
  },
  "lab_5": (code) => {
    // Check if contains CSS styling
    return code.includes('style') || code.includes('color:') || code.includes('background:');
  },
  "lab_6": (code) => {
    // Check if contains animation
    return code.includes('@keyframes') || code.includes('animation:') || code.includes('transition:');
  },
  "lab_7": (code) => {
    // Check if contains array or object
    return code.includes('[') && code.includes(']') || code.includes('{') && code.includes('}');
  },
  "lab_8": (code) => {
    // Check if contains responsive design
    return code.includes('@media') || code.includes('max-width') || code.includes('min-width');
  },
  "lab_9": (code) => {
    // Check if contains class definition
    return code.includes('class ') || code.includes('this.') || code.includes('constructor');
  },
  "lab_10": (code) => {
    // Check if contains interactive elements
    return code.includes('onclick') || code.includes('addEventListener') || code.includes('click');
  }
};

export default function CodeLab() {
  const [code, setCode] = useState("");
  const [webCode, setWebCode] = useState({
    html: "",
    css: "",
    js: ""
  });
  const [output, setOutput] = useState({ type: 'text', content: '' });
  const [language, setLanguage] = useState("javascript");
  const [editorMode, setEditorMode] = useState("text");
  const [template, setTemplate] = useState("basic");
  const [isRunning, setIsRunning] = useState(false);
  const [currentLab, setCurrentLab] = useState(null);
  const [currentQuest, setCurrentQuest] = useState(null);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [labCompleted, setLabCompleted] = useState(false);
  const [showLabCheck, setShowLabCheck] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const outputIframeRef = useRef(null);
  const blocklyGeneratedCodeRef = useRef(""); // Track Blockly generated code

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
        
        // Check if we have lab data from navigation
        if (location.state?.lab) {
          const lab = location.state.lab;
          setCurrentLab(lab);
          setLanguage(lab.language);
          
          // Load appropriate template
          if (lab.language === "web") {
            setWebCode({
              html: lab.template?.html || starterTemplates.web.basic.html,
              css: lab.template?.css || starterTemplates.web.basic.css,
              js: lab.template?.js || starterTemplates.web.basic.js
            });
          } else {
            setCode(lab.template || starterTemplates[lab.language]?.basic || "");
          }
          
          // Save that user started this lab
          await saveLabStart(currentUser.uid, lab);
        }
        
        if (location.state?.questId) {
          await fetchQuest(currentUser.uid, location.state.questId);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    // Load starter template if no lab is active
    if (!location.state?.lab) {
      if (language === "web") {
        setWebCode(starterTemplates.web.basic);
      } else {
        setCode(starterTemplates[language]?.[template] || starterTemplates.javascript.basic);
      }
    }

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

  const saveLabStart = async (userId, lab) => {
    try {
      await setDoc(doc(db, "users", userId, "labProgress", lab.id), {
        labId: lab.id,
        title: lab.title,
        startedAt: new Date(),
        progress: 0,
        lastActivity: new Date(),
        attempts: 0
      });
    } catch (error) {
      console.error("Error saving lab start:", error);
    }
  };

  const updateLabProgress = async (labId, progress) => {
    if (!user || !labId) return;
    
    try {
      const progressRef = doc(db, "users", user.uid, "labProgress", labId);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const currentData = progressDoc.data();
        await updateDoc(progressRef, {
          progress: progress,
          lastActivity: new Date(),
          attempts: (currentData.attempts || 0) + 1
        });
      }
    } catch (error) {
      console.error("Error updating lab progress:", error);
    }
  };

  const checkLabCompletion = async (lab, codeToCheck) => {
    if (!lab || !labCheckers[lab.id]) return false;
    
    const checker = labCheckers[lab.id];
    const codeString = language === "web" 
      ? JSON.stringify(webCode)
      : codeToCheck;
    
    const passed = checker(codeString);
    
    if (passed) {
      await completeLab(lab);
      setLabCompleted(true);
      setShowLabCheck(true);
      return true;
    } else {
      setShowLabCheck(true);
      return false;
    }
  };

  const completeLab = async (lab) => {
    if (!user) return;
    
    try {
      // Mark lab as completed
      await setDoc(doc(db, "users", user.uid, "completedLabs", lab.id), {
        labId: lab.id,
        title: lab.title,
        completedAt: new Date(),
        xpEarned: lab.xpReward,
        language: lab.language,
        ageGroup: userData?.ageGroup
      });

      // Update user XP
      await updateDoc(doc(db, "users", user.uid), {
        xp: increment(lab.xpReward),
        lastActive: new Date(),
        completedQuests: increment(1)
      });

      // Update leaderboard
      await updateDoc(doc(db, "leaderboard", user.uid), {
        xp: increment(lab.xpReward)
      });

      // Remove from progress collection
      const progressRef = doc(db, "users", user.uid, "labProgress", lab.id);
      await setDoc(progressRef, {
        completed: true,
        completedAt: new Date()
      }, { merge: true });

      // Add activity
      const activityId = Date.now().toString();
      await setDoc(doc(db, "users", user.uid, "activities", activityId), {
        type: "lab_completed",
        title: `Completed lab: ${lab.title}`,
        xp: lab.xpReward,
        timestamp: new Date()
      });

    } catch (error) {
      console.error("Error completing lab:", error);
    }
  };

  const runCode = async () => {
    if (!user) {
      alert("Please log in to run code!");
      navigate("/login");
      return;
    }

    let codeToRun = "";
    if (language === "web") {
      codeToRun = JSON.stringify(webCode);
    } else {
      // Use Blockly generated code if in Blockly mode, otherwise use text editor code
      if (language === "python" && editorMode === "blockly") {
        codeToRun = blocklyGeneratedCodeRef.current || code;
        // Also update the code state with blockly code
        if (blocklyGeneratedCodeRef.current && !code.trim()) {
          setCode(blocklyGeneratedCodeRef.current);
        }
      } else {
        codeToRun = code;
      }
    }

    if (!codeToRun.trim()) {
      alert("Please write some code first!");
      return;
    }

    setIsRunning(true);
    setOutput({ type: 'text', content: "Running your code... ⏳" });
    setLabCompleted(false);
    setShowLabCheck(false);

    try {
      let result;
      
      if (language === "python") {
        // Use external server for Python
        result = await runPythonOnServer(codeToRun);
      } else if (language === "web") {
        // Combine HTML, CSS, JS
        result = await runCombinedCode(webCode.html, webCode.css, webCode.js);
      } else {
        // Use browser runner for other languages
        result = await runCodeInBrowser(codeToRun, language);
      }
      
      if (result.success) {
        // Save activity to Firebase
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

        // Check lab completion if this is from a lab
        if (currentLab) {
          const newProgress = Math.min((currentLab.progress || 0) + 25, 100);
          await updateLabProgress(currentLab.id, newProgress);
          
          // Check if lab requirements are met
          const completed = await checkLabCompletion(currentLab, codeToRun);
          if (completed) {
            result.output += `\n\n🎉 LAB COMPLETED! +${currentLab.xpReward} XP!`;
          } else {
            result.output += `\n\n📊 Lab Progress: ${newProgress}%\nTry to complete the lab requirements!`;
          }
        }

        result.output += `\n\n✅ +10 XP for running code!`;
        
        // Set output based on type
        if (result.isHtml || language === "html" || language === "css" || language === "web") {
          setOutput({
            type: 'html',
            content: result.output,
            console: result.output.includes('🎉') ? result.output : 'Web content rendered below.',
            htmlContent: result.output // Store HTML content separately
          });
        } else {
          setOutput({
            type: 'text',
            content: result.output,
            console: result.output
          });
        }
        
      } else {
        setOutput({
          type: 'text',
          content: result.output,
          console: result.output
        });
      }
      
    } catch (error) {
      console.error("Error running code:", error);
      setOutput({
        type: 'text',
        content: `❌ Error: ${error.message}`,
        console: `❌ Error: ${error.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const saveCode = async () => {
    if (!user) {
      alert("Please log in to save code!");
      return;
    }

    setIsSaving(true);
    try {
      const saveId = Date.now().toString();
      const saveName = currentLab 
        ? `${currentLab.title} - ${new Date().toLocaleTimeString()}`
        : `Saved Code ${new Date().toLocaleTimeString()}`;
      
      const saveData = {
        language: language,
        timestamp: new Date(),
        name: saveName
      };
      
      if (language === "web") {
        saveData.webCode = webCode;
      } else {
        // Save the actual generated code from Blockly if in Blockly mode
        if (language === "python" && editorMode === "blockly") {
          saveData.code = blocklyGeneratedCodeRef.current || code;
        } else {
          saveData.code = code;
        }
      }
      
      if (currentLab) {
        saveData.labId = currentLab.id;
        saveData.labTitle = currentLab.title;
      }
      
      await setDoc(doc(db, "users", user.uid, "savedCode", saveId), saveData);
      
      alert("Code saved successfully! ✨");
    } catch (error) {
      console.error("Error saving code:", error);
      alert("Error saving code!");
    } finally {
      setIsSaving(false);
    }
  };

  const loadTemplate = (lang, temp) => {
    setLanguage(lang);
    setTemplate(temp);
    
    if (lang === "web") {
      setWebCode(starterTemplates.web[temp] || starterTemplates.web.basic);
      setEditorMode("text");
    } else {
      const templateCode = starterTemplates[lang]?.[temp];
      if (templateCode) {
        setCode(templateCode);
      }
      setEditorMode("text");
    }
    
    setCurrentLab(null);
  };

  const handleBlocklyCodeChange = (newCode) => {
    // Update the ref and also the code state
    blocklyGeneratedCodeRef.current = newCode;
    setCode(newCode);
  };

  const clearLab = () => {
    setCurrentLab(null);
    if (language === "web") {
      setWebCode(starterTemplates.web.basic);
    } else {
      setCode(starterTemplates[language]?.[template] || starterTemplates.javascript.basic);
    }
    setLabCompleted(false);
    setShowLabCheck(false);
  };

  const checkLabRequirements = () => {
    if (!currentLab) return;
    
    const checker = labCheckers[currentLab.id];
    if (!checker) {
      alert("No specific requirements for this lab. Complete the task as described!");
      return;
    }
    
    const codeToCheck = language === "web" ? JSON.stringify(webCode) : code;
    const passed = checker(codeToCheck);
    
    if (passed) {
      alert("✅ Great! Your code meets the lab requirements!\nRun the code and then click 'Complete Lab' to finish.");
    } else {
      alert("❌ Your code doesn't meet all requirements yet.\nCheck the lab objectives and try again!");
    }
  };

  // Full Screen Preview Component
  const FullScreenPreview = () => {
    useEffect(() => {
      // Add styles to body when fullscreen is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, []);

    return (
      <div className="fullscreen-preview">
        <div className="fullscreen-header">
          <button 
            className="back-button"
            onClick={() => setShowFullScreenPreview(false)}
          >
            ← Back to Editor
          </button>
          <h3>🌐 Full Screen Preview</h3>
          <button 
            className="close-btn"
            onClick={() => setShowFullScreenPreview(false)}
          >
            ✕ Close
          </button>
        </div>
        <iframe
          title="fullscreen-output"
          srcDoc={output.content}
          className="fullscreen-iframe"
          sandbox="allow-scripts"
        />
      </div>
    );
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
  const supportsBlockly = currentLanguage?.supportsBlockly;
  const isWebMode = language === "web";

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

        {/* Lab Info Bar */}
        {currentLab && (
          <div className="lab-info-bar">
            <div className="lab-info-content">
              <h3>🧪 Current Lab: {currentLab.title}</h3>
              <p>{currentLab.description}</p>
              <div className="lab-objectives">
                <strong>Objectives:</strong>
                <ul>
                  {currentLab.objectives?.map((obj, idx) => (
                    <li key={idx}>✓ {obj}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="lab-actions">
              <button 
                className="secondary-btn"
                onClick={clearLab}
              >
                Clear Lab
              </button>
              <button 
                className="secondary-btn"
                onClick={checkLabRequirements}
              >
                Check Requirements
              </button>
              {labCompleted && (
                <button 
                  className="success-btn"
                  onClick={() => completeLab(currentLab)}
                >
                  ✅ Complete Lab
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quest Info Bar */}
        {currentQuest && !currentLab && (
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

        {/* Lab Completion Message */}
        {showLabCheck && (
          <div className={`lab-check-message ${labCompleted ? 'success' : 'warning'}`}>
            {labCompleted ? (
              <>
                <span>🎉 Lab requirements met! Click "Complete Lab" to finish.</span>
                <button onClick={() => setShowLabCheck(false)}>×</button>
              </>
            ) : (
              <>
                <span>📋 Keep working! Your code doesn't meet all requirements yet.</span>
                <button onClick={() => setShowLabCheck(false)}>×</button>
              </>
            )}
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
                setEditorMode("text");
                if (currentLab && currentLab.language !== lang.id) {
                  setCurrentLab(null);
                }
              }}
              disabled={currentLab && currentLab.language !== lang.id}
            >
              {lang.icon} {lang.name}
              {currentLab && currentLab.language === lang.id && " 🔒"}
            </button>
          ))}
        </div>

        {/* Editor Mode Toggle - Only for Python */}
        {supportsBlockly && (
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
              🧩 Python Blockly
            </button>
          </div>
        )}

        {/* Template Selector */}
        {!currentLab && (
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
        )}

        {/* Main Editor Area */}
        <div className="codelab-container">
          {/* Editor Panel */}
          <div className="editor-panel">
            <div className="editor-header">
              <div className="editor-info">
                <h3>
                  {editorMode === "blockly" 
                    ? "🧩 Python Blockly Editor"
                    : isWebMode
                      ? "🌍 Web Editor (HTML+CSS+JS)"
                      : "📝 Code Editor"}
                  <span className="language-badge">{currentLanguage?.name}</span>
                  {currentLab && <span className="lab-badge">🧪 {currentLab.title}</span>}
                </h3>
              </div>
              <div className="editor-actions">
                <button 
                  className="action-btn" 
                  onClick={saveCode}
                  disabled={isSaving}
                >
                  {isSaving ? "💾 Saving..." : "💾 Save"}
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
                <PythonBlocklyEditor 
                  onCodeChange={handleBlocklyCodeChange}
                  initialCode={code}
                  ageGroup={userData?.ageGroup || "9-11"}
                  currentLab={currentLab}
                />
              ) : isWebMode ? (
                <CombinedEditor
                  htmlCode={webCode.html}
                  setHtmlCode={(html) => setWebCode({...webCode, html})}
                  cssCode={webCode.css}
                  setCssCode={(css) => setWebCode({...webCode, css})}
                  jsCode={webCode.js}
                  setJsCode={(js) => setWebCode({...webCode, js})}
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
              <div className="output-actions">
                {(output.type === 'html' || language === "web" || language === "html") && output.content && (
                  <button 
                    className="fullscreen-btn"
                    onClick={() => setShowFullScreenPreview(true)}
                  >
                    🔍 Full Screen
                  </button>
                )}
                <button 
                  className="clear-btn"
                  onClick={() => setOutput({ type: 'text', content: '' })}
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="output-content-wrapper">
              {output.type === 'html' ? (
                <>
                  <div className="output-console">
                    <pre>{output.console}</pre>
                  </div>
                  <div className="html-output-container">
                    <div className="html-output-header">
                      <h4>Web Preview:</h4>
                      <button 
                        className="action-btn small"
                        onClick={() => {
                          if (outputIframeRef.current) {
                            outputIframeRef.current.contentDocument.location.reload();
                          }
                        }}
                      >
                        🔄 Refresh
                      </button>
                    </div>
                    <iframe
                      ref={outputIframeRef}
                      title="code-output"
                      srcDoc={output.content}
                      className="html-output"
                      sandbox="allow-scripts"
                    />
                  </div>
                </>
              ) : (
                <pre className="output-content">
                  {output.content || "Run your code to see the output here..."}
                </pre>
              )}
            </div>
            
            {/* Tips Section */}
            <div className="tips-section">
              <h4>💡 Tips for Young Coders:</h4>
              <ul>
                <li>Always save your work before running</li>
                <li>Start with simple code and make it more complex</li>
                <li>Use comments to explain your code</li>
                <li>Don't worry about errors - they're learning opportunities!</li>
                <li>Complete labs to earn more XP and unlock new skills</li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button 
                className="action-btn"
                onClick={() => {
                  if (currentLab) {
                    if (isWebMode) {
                      setWebCode({
                        html: currentLab.template?.html || "",
                        css: currentLab.template?.css || "",
                        js: currentLab.template?.js || ""
                      });
                    } else {
                      setCode(currentLab.template || "");
                    }
                  } else {
                    if (isWebMode) {
                      setWebCode(starterTemplates.web[template] || starterTemplates.web.basic);
                    } else {
                      const templateCode = starterTemplates[language]?.[template] || "";
                      setCode(templateCode);
                    }
                  }
                }}
              >
                🔄 Reset Code
              </button>
              <button 
                className="action-btn"
                onClick={() => {
                  const text = isWebMode ? JSON.stringify(webCode, null, 2) : code;
                  navigator.clipboard.writeText(text);
                }}
              >
                📋 Copy Code
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate("/mentor")}
              >
                🤖 Ask Mentor
              </button>
              {currentLab && !labCompleted && (
                <button 
                  className="action-btn"
                  onClick={checkLabRequirements}
                >
                  ✅ Check Lab
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Code Examples */}
        {!currentLab && (
          <div className="examples-section">
            <h3>Try These Examples:</h3>
            <div className="examples-grid">
              <div className="example-card">
                <h4>Hello World</h4>
                <pre>{language === "python" 
                  ? `print("Hello, World!")`
                  : language === "javascript"
                  ? `console.log("Hello, World!");`
                  : language === "html"
                  ? `<h1>Hello, World!</h1>`
                  : language === "css"
                  ? `h1 { color: blue; }`
                  : `Web Example`}</pre>
                <button 
                  className="try-btn"
                  onClick={() => {
                    if (language === "python") setCode('print("Hello, World!")');
                    else if (language === "javascript") setCode('console.log("Hello, World!");');
                    else if (language === "html") setCode('<h1>Hello, World!</h1>');
                    else if (language === "css") setCode('h1 { color: blue; }');
                    else if (language === "web") setWebCode(starterTemplates.web.basic);
                    setEditorMode("text");
                  }}
                >
                  Try This
                </button>
              </div>
              <div className="example-card">
                <h4>Variables</h4>
                <pre>{language === "python" 
                  ? `name = "Coder"\nage = 10\nprint(name, age)`
                  : language === "javascript"
                  ? `let name = "Coder";\nlet age = 10;\nconsole.log(name, age);`
                  : language === "html"
                  ? `<div>\n  <p>Name: Coder</p>\n  <p>Age: 10</p>\n</div>`
                  : language === "css"
                  ? `.info {\n  color: green;\n  font-size: 18px;\n}`
                  : `Web Example`}</pre>
                <button 
                  className="try-btn"
                  onClick={() => {
                    if (language === "python") setCode('name = "Coder"\nage = 10\nprint(name, age)');
                    else if (language === "javascript") setCode('let name = "Coder";\nlet age = 10;\nconsole.log(name, age);');
                    else if (language === "html") setCode('<div>\n  <p>Name: Coder</p>\n  <p>Age: 10</p>\n</div>');
                    else if (language === "css") setCode('.info {\n  color: green;\n  font-size: 18px;\n}');
                    else if (language === "web") setWebCode(starterTemplates.web.basic);
                    setEditorMode("text");
                  }}
                >
                  Try This
                </button>
              </div>
              <div className="example-card">
                <h4>Loop</h4>
                <pre>{language === "python" 
                  ? `for i in range(5):\n    print("Number", i)`
                  : language === "javascript"
                  ? `for(let i=0; i<5; i++) {\n  console.log("Number", i);\n}`
                  : language === "html"
                  ? `<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>`
                  : language === "css"
                  ? `li {\n  list-style: square;\n  margin: 5px;\n}`
                  : `Web Example`}</pre>
                <button 
                  className="try-btn"
                  onClick={() => {
                    if (language === "python") setCode('for i in range(5):\n    print("Number", i)');
                    else if (language === "javascript") setCode('for(let i=0; i<5; i++) {\n  console.log("Number", i);\n}');
                    else if (language === "html") setCode('<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>');
                    else if (language === "css") setCode('li {\n  list-style: square;\n  margin: 5px;\n}');
                    else if (language === "web") setWebCode(starterTemplates.web.basic);
                    setEditorMode("text");
                  }}
                >
                  Try This
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Full Screen Preview Modal */}
      {showFullScreenPreview && <FullScreenPreview />}
    </div>
  );
}