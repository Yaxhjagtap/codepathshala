import { runCode } from "../services/api";
import { useState } from "react";

export default function CodeLab() {
  const [code, setCode] = useState("");

  const run = async () => {
    const res = await runCode(code);
    alert(res.output);
  };

  return (
    <div>
      <textarea
        rows={10}
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button onClick={run}>Run Code</button>
    </div>
  );
}
