import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { code } = req.body;
  if (code.includes("print")) {
    res.json({ success: true, output: "Hello World" });
  } else {
    res.json({ success: false, error: "Error in code" });
  }
});

export default router;
