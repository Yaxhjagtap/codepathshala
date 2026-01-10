import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  res.json({
    output: "Code executed successfully! +100 XP 🎉",
  });
});

export default router;
