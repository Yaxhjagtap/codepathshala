import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { name: "DragonCoder", xp: 15420 },
    { name: "StarNinja", xp: 14850 },
    { name: "Alex", xp: 13200 },
  ]);
});

export default router;
