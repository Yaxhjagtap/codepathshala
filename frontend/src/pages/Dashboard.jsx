import Sidebar from "../components/Sidebar";
import XPBar from "../components/XPBar";
import "../styles/dashboard.css";

export default function Dashboard() {
  return (
    <div className="layout">
      <Sidebar />

      <main>
        <h1>Welcome back, Alex!</h1>
        <XPBar current={2450} total={3000} />

        <section className="card">
          <h3>Continue Your Quest</h3>
          <p>Function Potions – 33% complete</p>
          <button>Continue Learning</button>
        </section>
      </main>
    </div>
  );
}
