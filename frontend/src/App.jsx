import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import QuestMap from "./pages/QuestMap";
import CodeLab from "./pages/CodeLab";
import Mentor from "./pages/Mentor";
import Avatar from "./pages/Avatar";
import LeaderboardPage from "./pages/LeaderboardPage";
import Labs from "./components/Labs";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/dashboard.css";
import "./styles/codelab.css";
import "./styles/labs.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quests"
          element={
            <ProtectedRoute>
              <QuestMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/code"
          element={
            <ProtectedRoute>
              <CodeLab />
            </ProtectedRoute>
          }
        />

        <Route
          path="/labs"
          element={
            <ProtectedRoute>
              <Labs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor"
          element={
            <ProtectedRoute>
              <Mentor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/avatar"
          element={
            <ProtectedRoute>
              <Avatar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}