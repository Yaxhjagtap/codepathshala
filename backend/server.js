import express from "express";
import cors from "cors";

import mentor from "./routes/mentor.js";
import run from "./routes/runCode.js";
import leaderboard from "./routes/leaderboard.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/mentor", mentor);
app.use("/api/run", run);
app.use("/api/leaderboard", leaderboard);

app.listen(5000, () => console.log("Backend running"));
