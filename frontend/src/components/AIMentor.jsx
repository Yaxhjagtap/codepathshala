import { askMentor } from "../services/api";
import { useState } from "react";

export default function AIMentor() {
  const [reply, setReply] = useState("");

  const ask = async () => {
    const res = await askMentor("My code is not working");
    setReply(res.data.reply);
  };

  return (
    <div>
      <button onClick={ask}>Ask AI Mentor</button>
      <p className="mt-2">{reply}</p>
    </div>
  );
}
