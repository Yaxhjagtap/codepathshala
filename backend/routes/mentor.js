import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  res.json({
    reply: "Check your loop condition 😊 Try using < instead of <="
  });
});

export default router;
