import { useState, useEffect } from "react";
import { auth, db } from "../firebase/auth";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  setDoc,
  increment
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/dashboard.css";

// Age-based lab curriculum
const labCurriculum = {
  "6-8": [
    {
      id: "lab_1",
      title: "My First Webpage",
      description: "Create your very first HTML page",
      difficulty: "beginner",
      xpReward: 100,
      duration: "15 min",
      prerequisites: [],
      language: "html",
      template: `<!DOCTYPE html>
<html>
<head>
  <title>My First Webpage</title>
</head>
<body>
  <h1>Welcome to my website!</h1>
  <p>My name is ________</p>
  <p>I am ____ years old</p>
  <ul>
    <li>My favorite color: ________</li>
    <li>My favorite animal: ________</li>
    <li>My favorite food: ________</li>
  </ul>
</body>
</html>`,
      objectives: [
        "Create an HTML document structure",
        "Add headings and paragraphs",
        "Create a list of favorite things"
      ]
    },
    {
      id: "lab_2",
      title: "Colorful Page",
      description: "Add colors to your webpage",
      difficulty: "beginner",
      xpReward: 120,
      duration: "20 min",
      prerequisites: ["lab_1"],
      language: "css",
      template: `<style>
body {
  background-color: lightblue;
  font-family: Arial, sans-serif;
}

h1 {
  color: darkblue;
  text-align: center;
}

p {
  color: green;
  font-size: 18px;
}

.favorite {
  color: purple;
  font-weight: bold;
}
</style>

<h1>My Colorful Page</h1>
<p>This is my colorful webpage!</p>
<p class="favorite">My favorite things:</p>
<ul>
  <li>Color: ________</li>
  <li>Game: ________</li>
  <li>Place: ________</li>
</ul>`,
      objectives: [
        "Add background colors",
        "Style text with colors",
        "Use CSS classes"
      ]
    },
    {
      id: "lab_3",
      title: "Interactive Greeting",
      description: "Make your page interactive with JavaScript",
      difficulty: "beginner",
      xpReward: 150,
      duration: "25 min",
      prerequisites: ["lab_1", "lab_2"],
      language: "javascript",
      template: `// This code says hello to the user
function sayHello() {
  let name = "YOUR_NAME_HERE";
  let message = "Hello, " + name + "! Welcome to coding!";
  console.log(message);
  alert(message);
}

// Call the function
sayHello();

// Practice: Change the name and run again!`,
      objectives: [
        "Create a JavaScript function",
        "Use variables",
        "Call a function",
        "Display messages"
      ]
    }
  ],
  "9-11": [
    {
      id: "lab_4",
      title: "Magic Calculator",
      description: "Build a simple calculator with buttons",
      difficulty: "intermediate",
      xpReward: 200,
      duration: "30 min",
      prerequisites: [],
      language: "html",
      template: `<!DOCTYPE html>
<html>
<head>
  <title>Magic Calculator</title>
  <style>
    .calculator {
      background-color: #f0f0f0;
      padding: 20px;
      border-radius: 10px;
      width: 200px;
      margin: 50px auto;
    }
    .display {
      background: white;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 10px;
      text-align: right;
      font-size: 24px;
      min-height: 30px;
    }
    .buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    button {
      padding: 15px;
      font-size: 18px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #ddd;
    }
  </style>
</head>
<body>
  <div class="calculator">
    <div class="display" id="display">0</div>
    <div class="buttons">
      <button onclick="addNumber('7')">7</button>
      <button onclick="addNumber('8')">8</button>
      <button onclick="addNumber('9')">9</button>
      <button onclick="addNumber('+')">+</button>
      <button onclick="addNumber('4')">4</button>
      <button onclick="addNumber('5')">5</button>
      <button onclick="addNumber('6')">6</button>
      <button onclick="addNumber('-')">-</button>
      <button onclick="addNumber('1')">1</button>
      <button onclick="addNumber('2')">2</button>
      <button onclick="addNumber('3')">3</button>
      <button onclick="addNumber('*')">×</button>
      <button onclick="addNumber('0')">0</button>
      <button onclick="clearDisplay()">C</button>
      <button onclick="calculate()">=</button>
      <button onclick="addNumber('/')">÷</button>
    </div>
  </div>
  
  <script>
    function addNumber(num) {
      let display = document.getElementById('display');
      if (display.innerHTML === '0') {
        display.innerHTML = num;
      } else {
        display.innerHTML += num;
      }
    }
    
    function clearDisplay() {
      document.getElementById('display').innerHTML = '0';
    }
    
    function calculate() {
      let display = document.getElementById('display');
      try {
        display.innerHTML = eval(display.innerHTML);
      } catch (error) {
        display.innerHTML = 'Error';
      }
    }
  </script>
</body>
</html>`,
      objectives: [
        "Create HTML structure",
        "Style with CSS Grid",
        "Add JavaScript interactivity",
        "Handle button clicks"
      ]
    },
    {
      id: "lab_5",
      title: "Story Generator",
      description: "Create a story that changes based on user input",
      difficulty: "intermediate",
      xpReward: 250,
      duration: "35 min",
      prerequisites: ["lab_4"],
      language: "javascript",
      template: `// Story Generator Lab
// Fill in the blanks to create your story

function generateStory() {
  // Get user inputs
  let name = "Alex"; // Change this to your name
  let place = "forest";
  let creature = "dragon";
  let action = "flying";
  let item = "magic wand";
  
  // Create the story
  let story = \`Once upon a time, there was a brave adventurer named \${name}. 
\${name} went to the \${place} where they met a friendly \${creature}.
The \${creature} was \${action} with a \${item}.
Together, they went on an amazing adventure!\`;
  
  // Display the story
  console.log("📖 Your Story:");
  console.log(story);
  
  // Also show in an alert
  alert(story);
}

// Try changing the variables and run again!
generateStory();`,
      objectives: [
        "Use template literals",
        "Create interactive stories",
        "Practice variable usage",
        "Output formatting"
      ]
    },
    {
      id: "lab_6",
      title: "Animated Character",
      description: "Create a character with CSS animations",
      difficulty: "intermediate",
      xpReward: 300,
      duration: "40 min",
      prerequisites: ["lab_2"],
      language: "css",
      template: `<style>
body {
  background: linear-gradient(45deg, #ff9a9e, #fad0c4);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.character {
  position: relative;
  width: 150px;
  height: 200px;
}

.head {
  width: 80px;
  height: 80px;
  background-color: #FFD700;
  border-radius: 50%;
  position: absolute;
  top: 20px;
  left: 35px;
  animation: bounce 2s infinite;
}

.body {
  width: 60px;
  height: 80px;
  background-color: #4CAF50;
  position: absolute;
  top: 100px;
  left: 45px;
  border-radius: 10px;
}

.eye {
  width: 15px;
  height: 15px;
  background-color: black;
  border-radius: 50%;
  position: absolute;
  top: 40px;
}

.left-eye {
  left: 50px;
}

.right-eye {
  left: 100px;
}

.mouth {
  width: 30px;
  height: 10px;
  background-color: #FF5722;
  border-radius: 5px;
  position: absolute;
  top: 65px;
  left: 75px;
}

.arm {
  width: 60px;
  height: 15px;
  background-color: #4CAF50;
  position: absolute;
  top: 120px;
  border-radius: 10px;
  animation: wave 3s infinite;
}

.left-arm {
  left: 0;
  transform: rotate(30deg);
}

.right-arm {
  right: 0;
  transform: rotate(-30deg);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes wave {
  0%, 100% { transform: rotate(30deg); }
  50% { transform: rotate(-30deg); }
}

h1 {
  text-align: center;
  color: white;
  font-family: Arial, sans-serif;
}
</style>

<h1>My Animated Character</h1>
<div class="character">
  <div class="head"></div>
  <div class="body"></div>
  <div class="eye left-eye"></div>
  <div class="eye right-eye"></div>
  <div class="mouth"></div>
  <div class="arm left-arm"></div>
  <div class="arm right-arm"></div>
</div>`,
      objectives: [
        "Create CSS animations",
        "Use keyframes",
        "Position elements absolutely",
        "Create gradients"
      ]
    }
  ],
  "12-14": [
    {
      id: "lab_7",
      title: "Interactive Quiz Game",
      description: "Build a quiz game with scoring system",
      difficulty: "advanced",
      xpReward: 400,
      duration: "45 min",
      prerequisites: ["lab_4"],
      language: "javascript",
      template: `// Quiz Game - Interactive Lab

const quizQuestions = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language"
    ],
    answer: 0
  },
  {
    question: "Which language adds interactivity to web pages?",
    options: ["HTML", "CSS", "JavaScript", "Python"],
    answer: 2
  },
  {
    question: "What does CSS stand for?",
    options: [
      "Computer Style Sheets",
      "Creative Style System",
      "Cascading Style Sheets"
    ],
    answer: 2
  }
];

let currentQuestion = 0;
let score = 0;

function displayQuestion() {
  const question = quizQuestions[currentQuestion];
  console.log(\`\\nQuestion \${currentQuestion + 1}: \${question.question}\\n\`);
  
  question.options.forEach((option, index) => {
    console.log(\`\${index + 1}. \${option}\`);
  });
  
  // Simulate user answering (in real app, this would be user input)
  const userAnswer = question.answer; // This simulates correct answer
  
  if (userAnswer === question.answer) {
    score += 10;
    console.log("✅ Correct!");
  } else {
    console.log(\`❌ Wrong! The correct answer was: \${question.options[question.answer]}\`);
  }
  
  currentQuestion++;
  
  if (currentQuestion < quizQuestions.length) {
    setTimeout(displayQuestion, 1000);
  } else {
    showResults();
  }
}

function showResults() {
  console.log(\`\\n🎮 Quiz Completed!\\n\`);
  console.log(\`Your Score: \${score}/\${quizQuestions.length * 10}\`);
  console.log(\`Percentage: \${Math.round((score / (quizQuestions.length * 10)) * 100)}%\`);
  
  if (score === quizQuestions.length * 10) {
    console.log("🏆 Perfect Score! You're a coding master!");
  } else if (score >= (quizQuestions.length * 10) * 0.7) {
    console.log("⭐ Great job! Keep learning!");
  } else {
    console.log("👍 Good effort! Try again!");
  }
}

// Start the quiz
console.log("🎯 Welcome to the Coding Quiz!");
console.log("===============================");
displayQuestion();`,
      objectives: [
        "Work with arrays of objects",
        "Implement game logic",
        "Create scoring system",
        "Handle sequential operations"
      ]
    },
    {
      id: "lab_8",
      title: "Responsive Portfolio",
      description: "Create a responsive portfolio website",
      difficulty: "advanced",
      xpReward: 500,
      duration: "60 min",
      prerequisites: ["lab_1", "lab_2", "lab_3"],
      language: "html",
      template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Portfolio</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    /* Header */
    header {
      background: linear-gradient(135deg, #6c63ff, #4a43d4);
      color: white;
      padding: 2rem 0;
      text-align: center;
    }
    
    .hero {
      padding: 3rem 0;
    }
    
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    /* About Section */
    .about {
      padding: 4rem 0;
      background-color: #f9f9ff;
    }
    
    .about-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }
    
    /* Skills */
    .skills {
      padding: 4rem 0;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .skill-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    /* Projects */
    .projects {
      padding: 4rem 0;
      background-color: #f9f9ff;
    }
    
    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .project-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .project-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .project-content {
      padding: 1.5rem;
    }
    
    /* Footer */
    footer {
      background: #333;
      color: white;
      text-align: center;
      padding: 2rem 0;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .about-content {
        grid-template-columns: 1fr;
      }
      
      .hero h1 {
        font-size: 2rem;
      }
    }
    
    @media (max-width: 480px) {
      .skills-grid,
      .project-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="hero">
        <h1>Hi, I'm [Your Name]</h1>
        <p>Young Developer & Creative Coder</p>
        <p>Aspiring to create amazing things with code</p>
      </div>
    </div>
  </header>
  
  <section class="about">
    <div class="container">
      <h2 style="text-align: center; margin-bottom: 2rem;">About Me</h2>
      <div class="about-content">
        <div>
          <h3>My Journey</h3>
          <p>I started coding when I was [age] years old. I love creating websites, games, and solving problems with code. My favorite part about coding is seeing my ideas come to life on the screen.</p>
        </div>
        <div>
          <h3>My Interests</h3>
          <ul style="list-style-position: inside;">
            <li>Web Development</li>
            <li>Game Design</li>
            <li>AI & Machine Learning</li>
            <li>Digital Art</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  
  <section class="skills">
    <div class="container">
      <h2 style="text-align: center; margin-bottom: 2rem;">My Skills</h2>
      <div class="skills-grid">
        <div class="skill-card">
          <h3>HTML</h3>
          <p>Building website structure</p>
        </div>
        <div class="skill-card">
          <h3>CSS</h3>
          <p>Styling and design</p>
        </div>
        <div class="skill-card">
          <h3>JavaScript</h3>
          <p>Adding interactivity</p>
        </div>
      </div>
    </div>
  </section>
  
  <section class="projects">
    <div class="container">
      <h2 style="text-align: center; margin-bottom: 2rem;">My Projects</h2>
      <div class="project-grid">
        <div class="project-card">
          <div class="project-content">
            <h3>Personal Website</h3>
            <p>My first complete website with HTML and CSS</p>
          </div>
        </div>
        <div class="project-card">
          <div class="project-content">
            <h3>Calculator App</h3>
            <p>Interactive calculator with JavaScript</p>
          </div>
        </div>
        <div class="project-card">
          <div class="project-content">
            <h3>Quiz Game</h3>
            <p>Fun quiz game with scoring system</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <footer>
    <div class="container">
      <p>Contact me at: [your-email]@example.com</p>
      <p>© 2024 My Portfolio. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`,
      objectives: [
        "Create responsive layouts",
        "Implement CSS Grid and Flexbox",
        "Build multi-section website",
        "Add responsive design"
      ]
    }
  ],
  "15-16": [
    {
      id: "lab_9",
      title: "Weather Dashboard",
      description: "Build a weather dashboard with API integration",
      difficulty: "expert",
      xpReward: 600,
      duration: "75 min",
      prerequisites: ["lab_7"],
      language: "javascript",
      template: `// Weather Dashboard - Advanced Project

class WeatherDashboard {
  constructor() {
    this.cities = ['New York', 'London', 'Tokyo', 'Sydney', 'Mumbai'];
    this.currentCity = 'New York';
    this.temperatureUnit = 'C';
  }
  
  simulateWeatherData(city) {
    // Simulated weather data (in real app, this would come from API)
    const weatherData = {
      'New York': { temp: 22, condition: 'Sunny', humidity: 65, wind: 12 },
      'London': { temp: 15, condition: 'Cloudy', humidity: 78, wind: 8 },
      'Tokyo': { temp: 28, condition: 'Clear', humidity: 60, wind: 5 },
      'Sydney': { temp: 30, condition: 'Sunny', humidity: 55, wind: 15 },
      'Mumbai': { temp: 35, condition: 'Hot', humidity: 80, wind: 10 }
    };
    
    return weatherData[city] || { temp: 20, condition: 'Unknown', humidity: 50, wind: 0 };
  }
  
  displayWeather(city) {
    const weather = this.simulateWeatherData(city);
    let temp = weather.temp;
    
    // Convert temperature if needed
    if (this.temperatureUnit === 'F') {
      temp = (temp * 9/5) + 32;
    }
    
    console.log(\`\\n🌤️ Weather in \${city}:\`);
    console.log(\`========================\`);
    console.log(\`Temperature: \${temp.toFixed(1)}°\${this.temperatureUnit}\`);
    console.log(\`Condition: \${weather.condition}\`);
    console.log(\`Humidity: \${weather.humidity}%\`);
    console.log(\`Wind Speed: \${weather.wind} km/h\`);
  }
  
  toggleTemperatureUnit() {
    this.temperatureUnit = this.temperatureUnit === 'C' ? 'F' : 'C';
    console.log(\`\\nSwitched to °\${this.temperatureUnit}\`);
  }
  
  showAllCities() {
    console.log("\\n📊 Weather Overview:");
    console.log("====================");
    
    this.cities.forEach(city => {
      const weather = this.simulateWeatherData(city);
      console.log(\`\${city}: \${weather.temp}°C, \${weather.condition}\`);
    });
  }
  
  addCity(cityName) {
    if (!this.cities.includes(cityName)) {
      this.cities.push(cityName);
      console.log(\`\\n✅ Added \${cityName} to dashboard\`);
    } else {
      console.log(\`\\n⚠️ \${cityName} is already in the list\`);
    }
  }
}

// Usage
const dashboard = new WeatherDashboard();

console.log("🌍 Weather Dashboard");
console.log("===================");

dashboard.displayWeather('New York');
dashboard.showAllCities();
dashboard.toggleTemperatureUnit();
dashboard.displayWeather('Tokyo');
dashboard.addCity('Paris');
dashboard.showAllCities();`,
      objectives: [
        "Work with classes and objects",
        "Implement data simulation",
        "Create unit conversion",
        "Build dashboard functionality"
      ]
    },
    {
      id: "lab_10",
      title: "E-commerce Product Page",
      description: "Create a modern e-commerce product page",
      difficulty: "expert",
      xpReward: 700,
      duration: "90 min",
      prerequisites: ["lab_8"],
      language: "html",
      template: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TechStore - Product Page</title>
  <style>
    :root {
      --primary: #6c63ff;
      --secondary: #ff9f1c;
      --dark: #2a2d43;
      --light: #f8f9fa;
      --success: #10b981;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: var(--light);
      color: var(--dark);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    /* Header */
    .header {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary);
    }
    
    .cart-icon {
      position: relative;
      cursor: pointer;
    }
    
    .cart-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--secondary);
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }
    
    /* Product Section */
    .product-section {
      padding: 3rem 0;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: start;
    }
    
    .product-images img {
      width: 100%;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .product-info h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    .price {
      font-size: 2rem;
      color: var(--primary);
      font-weight: bold;
      margin: 1rem 0;
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem 0;
    }
    
    .stars {
      color: var(--secondary);
    }
    
    .description {
      margin: 2rem 0;
      line-height: 1.6;
    }
    
    /* Product Options */
    .options {
      margin: 2rem 0;
    }
    
    .option-group {
      margin: 1.5rem 0;
    }
    
    .option-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    .color-options {
      display: flex;
      gap: 1rem;
    }
    
    .color-option {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      border: 3px solid transparent;
    }
    
    .color-option.selected {
      border-color: var(--primary);
    }
    
    .color-blue { background-color: #3498db; }
    .color-black { background-color: #2c3e50; }
    .color-red { background-color: #e74c3c; }
    
    /* Quantity */
    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .quantity-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
    }
    
    .quantity-display {
      font-size: 1.5rem;
      font-weight: bold;
      min-width: 50px;
      text-align: center;
    }
    
    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: var(--primary);
      color: white;
      flex: 2;
    }
    
    .btn-secondary {
      background: var(--secondary);
      color: white;
      flex: 1;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    /* Features */
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin: 3rem 0;
    }
    
    .feature {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }
    
    .feature i {
      font-size: 2rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .product-grid {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="logo">🛒 TechStore</div>
        <div class="cart-icon">
          🛍️
          <span class="cart-count" id="cartCount">0</span>
        </div>
      </nav>
    </div>
  </header>
  
  <main class="container">
    <section class="product-section">
      <div class="product-grid">
        <div class="product-images">
          <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80" alt="Wireless Headphones">
        </div>
        
        <div class="product-info">
          <h1>Premium Wireless Headphones</h1>
          <div class="rating">
            <div class="stars">★★★★★</div>
            <span>4.8 (1,234 reviews)</span>
          </div>
          <div class="price">$129.99</div>
          
          <p class="description">
            Experience premium sound quality with our noise-cancelling wireless headphones. 
            Featuring 30-hour battery life, comfortable ear cushions, and crystal-clear 
            microphone for calls.
          </p>
          
          <div class="options">
            <div class="option-group">
              <label>Color:</label>
              <div class="color-options">
                <div class="color-option color-blue selected" onclick="selectColor('blue')"></div>
                <div class="color-option color-black" onclick="selectColor('black')"></div>
                <div class="color-option color-red" onclick="selectColor('red')"></div>
              </div>
            </div>
            
            <div class="option-group">
              <label>Quantity:</label>
              <div class="quantity-selector">
                <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                <span class="quantity-display" id="quantity">1</span>
                <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="addToCart()">Add to Cart</button>
            <button class="btn btn-secondary" onclick="buyNow()">Buy Now</button>
          </div>
        </div>
      </div>
    </section>
    
    <section class="features">
      <div class="feature">
        <div>🔋</div>
        <h3>30-hour Battery</h3>
        <p>All-day listening with quick charging</p>
      </div>
      <div class="feature">
        <div>🎵</div>
        <h3>Noise Cancelling</h3>
        <p>Immerse yourself in pure sound</p>
      </div>
      <div class="feature">
        <div>📞</div>
        <h3>Built-in Mic</h3>
        <p>Crystal clear calls</p>
      </div>
      <div class="feature">
        <div>🎧</div>
        <h3>Comfort Fit</h3>
        <p>Wear all day comfortably</p>
      </div>
    </section>
  </main>
  
  <script>
    let cartCount = 0;
    let quantity = 1;
    let selectedColor = 'blue';
    
    function selectColor(color) {
      selectedColor = color;
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      event.target.classList.add('selected');
      console.log(\`Selected color: \${color}\`);
    }
    
    function changeQuantity(change) {
      quantity = Math.max(1, quantity + change);
      document.getElementById('quantity').textContent = quantity;
    }
    
    function addToCart() {
      cartCount += quantity;
      document.getElementById('cartCount').textContent = cartCount;
      alert(\`Added \${quantity} item(s) to cart!\`);
    }
    
    function buyNow() {
      alert(\`Thank you for your purchase of \${quantity} \${selectedColor} headphones!\`);
      cartCount += quantity;
      document.getElementById('cartCount').textContent = cartCount;
    }
  </script>
</body>
</html>`,
      objectives: [
        "Build complex e-commerce UI",
        "Implement shopping cart functionality",
        "Create interactive product options",
        "Design responsive product page"
      ]
    }
  ]
};

export default function Labs() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [labs, setLabs] = useState([]);
  const [completedLabs, setCompletedLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
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
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        
        // Load labs based on age group
        const ageGroup = data.ageGroup || "9-11";
        const ageLabs = labCurriculum[ageGroup] || labCurriculum["9-11"];
        setLabs(ageLabs);
        
        // Fetch completed labs
        const completedQuery = query(
          collection(db, "users", userId, "completedLabs"),
          orderBy("completedAt", "desc")
        );
        const completedSnapshot = await getDocs(completedQuery);
        const completedData = completedSnapshot.docs.map(doc => doc.id);
        setCompletedLabs(completedData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

const startLab = (lab) => {
  // Check if user has completed prerequisites
  const prerequisitesMet = lab.prerequisites.every(prereq => 
    completedLabs.includes(prereq)
  );
  
  if (!prerequisitesMet) {
    alert(`Please complete previous labs first!\n\nPrerequisites: ${lab.prerequisites.join(', ')}`);
    return;
  }
  
  setSelectedLab(lab);
};


  const completeLab = async (labId) => {
    if (!user) return;
    
    try {
      const lab = labs.find(l => l.id === labId);
      if (!lab) return;
      
      // Mark lab as completed in Firebase
      await setDoc(doc(db, "users", user.uid, "completedLabs", labId), {
        labId: labId,
        title: lab.title,
        completedAt: new Date(),
        xpEarned: lab.xpReward,
        language: lab.language
      });
      
      // Update user XP
      await updateDoc(doc(db, "users", user.uid), {
        xp: increment(lab.xpReward),
        lastActive: new Date()
      });
      
      // Update local state
      setCompletedLabs([...completedLabs, labId]);
      
      // Update leaderboard
      await updateDoc(doc(db, "leaderboard", user.uid), {
        xp: increment(lab.xpReward)
      });
      
      alert(`🎉 Lab completed! You earned ${lab.xpReward} XP!`);
      setSelectedLab(null);
      
      // Refresh user data
      await fetchUserData(user.uid);
      
    } catch (error) {
      console.error("Error completing lab:", error);
      alert("Error completing lab. Please try again.");
    }
  };

  const getLabProgress = () => {
    const totalLabs = labs.length;
    const completed = completedLabs.length;
    return {
      completed,
      total: totalLabs,
      percentage: totalLabs > 0 ? Math.round((completed / totalLabs) * 100) : 0
    };
  };

  const getLanguageIcon = (language) => {
    switch(language) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'javascript': return '⚡';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Labs...</p>
        </main>
      </div>
    );
  }

  const progress = getLabProgress();

  return (
    <div className="layout">
      <Sidebar />
      
      <main>
        {/* Header */}
        <div className="labs-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1>🧪 Coding Labs</h1>
          <div className="header-actions">
            <span className="user-info-small">
              {userData?.username || "Coder"} • {userData?.xp || 0} XP
            </span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="progress-card">
          <div className="progress-info">
            <h3>Your Learning Journey</h3>
            <p>Complete labs to earn XP and unlock new skills!</p>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-value">{progress.completed}</span>
                <span className="stat-label">Labs Completed</span>
              </div>
              <div className="stat">
                <span className="stat-value">{progress.total}</span>
                <span className="stat-label">Total Labs</span>
              </div>
              <div className="stat">
                <span className="stat-value">{progress.percentage}%</span>
                <span className="stat-label">Overall Progress</span>
              </div>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="progress-hint">
              {progress.percentage === 100 ? "🎉 All labs completed!" :
               progress.percentage >= 70 ? "Great progress! Keep going!" :
               "Start your coding journey!"}
            </p>
          </div>
        </div>

        {/* Age Group Info */}
        <div className="age-group-info">
          <div className="age-badge-large">
            <span className="age-icon">
              {userData?.ageGroup === "6-8" ? "👶" :
               userData?.ageGroup === "9-11" ? "🧒" :
               userData?.ageGroup === "12-14" ? "🧑" : "👨"}
            </span>
            <div className="age-details">
              <h4>Age Group: {userData?.ageGroup || "9-11"} years</h4>
              <p>Customized labs for your skill level</p>
            </div>
          </div>
        <button 
  className="primary-btn"
  onClick={() => {
    navigate("/code", {
      state: {
        lab: selectedLab,
        template: selectedLab.template,
        language: selectedLab.language
      }
    });
    setSelectedLab(null);
  }}
>
  💻 Open in Code Editor
</button>
        </div>

        {/* Labs Grid */}
        <div className="labs-container">
          <h2>Available Labs</h2>
          <div className="labs-grid">
            {labs.map((lab, index) => {
              const isCompleted = completedLabs.includes(lab.id);
              const prerequisitesMet = lab.prerequisites.every(prereq => 
                completedLabs.includes(prereq)
              );
              
              return (
                <div 
                  key={lab.id}
                  className={`lab-card ${isCompleted ? "completed" : ""} ${!prerequisitesMet ? "locked" : ""}`}
                >
                  <div className="lab-card-header">
                    <div className="lab-icon">
                      {getLanguageIcon(lab.language)}
                    </div>
                    <div className="lab-meta">
                      <span className="lab-number">Lab {index + 1}</span>
                      <span className="lab-difficulty">{lab.difficulty}</span>
                    </div>
                  </div>
                  
                  <div className="lab-card-content">
                    <h3>{lab.title}</h3>
                    <p className="lab-description">{lab.description}</p>
                    
                    <div className="lab-details">
                      <span className="lab-detail">⏱️ {lab.duration}</span>
                      <span className="lab-detail">⭐ {lab.xpReward} XP</span>
                      <span className="lab-detail">{lab.language.toUpperCase()}</span>
                    </div>
                    
                    <div className="objectives">
                      <h4>You will learn:</h4>
                      <ul>
                        {lab.objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="lab-card-footer">
                    {isCompleted ? (
                      <button className="success-btn" disabled>
                        ✅ Completed
                      </button>
                    ) : !prerequisitesMet ? (
                      <button className="locked-btn" disabled>
                        🔒 Complete previous labs
                      </button>
                    ) : (
                      <button 
                        className="primary-btn"
                        onClick={() => startLab(lab)}
                      >
                        Start Lab →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lab Modal */}
        {selectedLab && (
          <div className="modal-overlay">
            <div className="modal-content lab-modal">
              <div className="modal-header">
                <h2>{selectedLab.title}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedLab(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="lab-info">
                  <div className="lab-stats">
                    <span className="lab-stat">
                      <strong>Language:</strong> {selectedLab.language.toUpperCase()}
                    </span>
                    <span className="lab-stat">
                      <strong>Duration:</strong> {selectedLab.duration}
                    </span>
                    <span className="lab-stat">
                      <strong>XP Reward:</strong> {selectedLab.xpReward}
                    </span>
                  </div>
                  
                  <div className="lab-description-full">
                    <h3>Description</h3>
                    <p>{selectedLab.description}</p>
                  </div>
                  
                  <div className="objectives-full">
                    <h3>Learning Objectives</h3>
                    <ul>
                      {selectedLab.objectives.map((obj, idx) => (
                        <li key={idx}>✅ {obj}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="instructions">
                    <h3>Instructions</h3>
                    <ol>
                      <li>Click "Open in Code Editor" to start working</li>
                      <li>Follow the template and complete the code</li>
                      <li>Run your code to test it</li>
                      <li>Click "Complete Lab" when you're done</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="secondary-btn"
                  onClick={() => setSelectedLab(null)}
                >
                  Cancel
                </button>
                <button 
                  className="primary-btn"
                  onClick={() => {
                    navigate("/code", {
                      state: {
                        lab: selectedLab,
                        template: selectedLab.template,
                        language: selectedLab.language
                      }
                    });
                    setSelectedLab(null);
                  }}
                >
                  💻 Open in Code Editor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Certificate Preview */}
        {progress.completed > 0 && (
          <div className="certificate-preview">
            <h3>🎓 Your Achievements</h3>
            <div className="achievements-grid">
              {completedLabs.map((labId, index) => {
                const lab = labs.find(l => l.id === labId);
                if (!lab) return null;
                
                return (
                  <div key={labId} className="achievement-badge">
                    <div className="badge-icon">
                      {getLanguageIcon(lab.language)}
                    </div>
                    <div className="badge-content">
                      <strong>{lab.title}</strong>
                      <span>{lab.xpReward} XP earned</span>
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
            {progress.completed === progress.total && (
              <div className="completion-celebration">
                <h3>🎉 All Labs Completed!</h3>
                <p>You've mastered all the labs in your age group!</p>
                <button 
                  className="celebrate-btn"
                  onClick={() => {
                    alert("🎊 Congratulations! You're a coding wizard! Share your achievement!");
                  }}
                >
                  🎊 Celebrate Achievement
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}