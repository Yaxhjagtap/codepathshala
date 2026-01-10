import { askMentor } from "../services/api";
import { useState } from "react";
import "../styles/dashboard.css";

export default function Mentor() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const send = async () => {
    const res = await askMentor(msg);
    setChat([...chat, { user: msg }, { bot: res.reply }]);
    setMsg("");
  };

  return (
    <>
      {chat.map((c, i) => (
        <div key={i}>{c.user || c.bot}</div>
      ))}
      <input value={msg} onChange={e => setMsg(e.target.value)} />
      <button onClick={send}>Ask Cody</button>
    </>
  );
}
