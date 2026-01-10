import * as Blockly from "blockly";
import { useEffect } from "react";

export default function BlocklyEditor() {
  useEffect(() => {
    const workspace = Blockly.inject("blocklyDiv", {
      toolbox: `
        <xml>
          <block type="controls_repeat_ext"></block>
          <block type="math_number"></block>
          <block type="text_print"></block>
        </xml>
      `,
    });

    // Optional: log generated code
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log(code);
  }, []);

  return (
    <div
      id="blocklyDiv"
      style={{ height: "400px", width: "100%", background: "#fff" }}
    />
  );
}
