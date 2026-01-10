import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { name: "Kid A", xp: 100 },
    { name: "Kid B", xp: 80 }
  ]);
});

export default router;
