import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  res.json({
    reply:
      "Think of a variable like a magic box 🪄 where you store values!",
  });
});

export default router;
