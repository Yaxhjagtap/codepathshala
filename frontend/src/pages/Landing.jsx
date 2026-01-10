import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      
      {/* Background Decoration (Matches Login Page) */}
      <div className="bg-decoration">
        {/* Top Left Star */}
        <img 
            src="https://img.icons8.com/emoji/48/star-emoji.png" 
            alt="star" 
            className="floating-star"
            style={{ top: '10%', left: '5%', width: '40px' }}
        />
        {/* Bottom Right Star */}
        <img 
            src="https://img.icons8.com/emoji/48/sparkles-emoji.png" 
            alt="sparkles" 
            className="floating-star"
            style={{ top: '60%', right: '10%', width: '50px', animationDelay: '1s' }}
        />
        {/* Middle Left */}
        <img 
            src="https://img.icons8.com/fluency/48/rocket.png" 
            alt="rocket" 
            className="floating-star"
            style={{ top: '40%', left: '15%', width: '30px', animationDelay: '2s', opacity: 0.5 }}
        />
      </div>

      {/* NAVBAR */}
      <nav className="navbar">
        <h1 className="brand">CodePathshala</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate("/login")} className="btn btn-secondary">
            Login
          </button>
          <button onClick={() => navigate("/register")} className="btn btn-primary">
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <h1 className="hero-title">
          Coding ki Asli <br />
          <span className="hero-highlight">Paathshala 🚀</span>
        </h1>
        
        <p className="hero-subtitle">
          A gamified coding platform for kids (6–16) that teaches 
          real programming through quests, stories, and AI mentorship.
        </p>

        <button 
          onClick={() => navigate("/register")} 
          className="btn btn-primary"
          style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}
        >
          Start Your Quest 🎮
        </button>
      </section>

      {/* SQUARE FLASH CARDS */}
      <section className="section">
        <h2 className="section-title">How It Works</h2>
        
        <div className="flash-grid">
          {[
            { 
              title: "Create Avatar", 
              desc: "Build your digital identity", 
              icon: "👾" 
            },
            { 
              title: "Pick World", 
              desc: "Choose age-based tracks", 
              icon: "🌍" 
            },
            { 
              title: "Solve Quests", 
              desc: "Learn logic by playing", 
              icon: "🧩" 
            },
            { 
              title: "Win Badges", 
              desc: "Showcase your skills", 
              icon: "🏆" 
            },
          ].map((card, i) => (
            <div key={i} className="flash-card">
              <div className="card-icon-bg">{card.icon}</div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-desc">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CODEPATHSHALA */}
      <section className="section" style={{ marginTop: '5rem' }}>
        <h2 className="section-title">Why Kids Love Us?</h2>
        
        <div className="why-grid">
          {[
            "Gamified Learning 🎮",
            "AI Mentor Support 🤖",
            "Real Python & JS 🐍",
            "Weekly Battles ⚔️",
            "Project Building 🏗️",
            "Safe Community 🛡️"
          ].map((text, i) => (
            <div key={i} className="feature-pill">
              <span className="feature-text">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © 2026 CodePathshala — The Fun Way to Code
      </footer>

    </div>
  );
}