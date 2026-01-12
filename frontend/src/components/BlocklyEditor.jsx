import { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import "blockly/blocks";

// Custom blocks for young coders
const createCustomBlocks = () => {
  Blockly.Blocks['print_text'] = {
    init: function() {
      this.appendValueInput("TEXT")
          .setCheck("String")
          .appendField("print");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Print text to console");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['if_then'] = {
    init: function() {
      this.appendValueInput("CONDITION")
          .setCheck("Boolean")
          .appendField("if");
      this.appendStatementInput("DO")
          .appendField("then");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip("If condition is true, then do something");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['repeat_times'] = {
    init: function() {
      this.appendValueInput("TIMES")
          .setCheck("Number")
          .appendField("repeat");
      this.appendStatementInput("DO")
          .appendField("times");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Repeat actions multiple times");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['create_variable'] = {
    init: function() {
      this.appendValueInput("VALUE")
          .appendField("create variable")
          .appendField(new Blockly.FieldTextInput("name"), "NAME");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Create a new variable");
      this.setHelpUrl("");
    }
  };

  // Generators for custom blocks
  javascriptGenerator['print_text'] = function(block) {
    const text = javascriptGenerator.valueToCode(block, 'TEXT', javascriptGenerator.ORDER_NONE);
    return `console.log(${text});\n`;
  };

  javascriptGenerator['if_then'] = function(block) {
    const condition = javascriptGenerator.valueToCode(block, 'CONDITION', javascriptGenerator.ORDER_NONE);
    const doCode = javascriptGenerator.statementToCode(block, 'DO');
    return `if (${condition}) {\n${doCode}}\n`;
  };

  javascriptGenerator['repeat_times'] = function(block) {
    const times = javascriptGenerator.valueToCode(block, 'TIMES', javascriptGenerator.ORDER_NONE);
    const doCode = javascriptGenerator.statementToCode(block, 'DO');
    return `for (let i = 0; i < ${times}; i++) {\n${doCode}}\n`;
  };

  javascriptGenerator['create_variable'] = function(block) {
    const name = block.getFieldValue('NAME');
    const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_NONE);
    return `let ${name} = ${value};\n`;
  };
};

export default function BlocklyEditor({ onCodeChange, initialCode = "" }) {
  const blocklyDivRef = useRef(null);
  const workspaceRef = useRef(null);
  const toolboxRef = useRef(null);

  useEffect(() => {
    if (!blocklyDivRef.current) return;

    // Create custom blocks
    createCustomBlocks();

    // Define toolbox
    toolboxRef.current = `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <category name="Variables" colour="#6c63ff">
          <block type="variables_get"></block>
          <block type="variables_set"></block>
          <block type="create_variable"></block>
          <block type="math_number"></block>
          <block type="text"></block>
          <block type="logic_boolean"></block>
        </category>
        <category name="Logic" colour="#ff9f1c">
          <block type="controls_if"></block>
          <block type="if_then"></block>
          <block type="logic_compare"></block>
          <block type="logic_operation"></block>
          <block type="logic_negate"></block>
        </category>
        <category name="Loops" colour="#4CAF50">
          <block type="controls_repeat_ext"></block>
          <block type="repeat_times"></block>
          <block type="controls_whileUntil"></block>
        </category>
        <category name="Functions" colour="#2196F3">
          <block type="print_text"></block>
          <block type="text_print"></block>
          <block type="text_join"></block>
          <block type="math_arithmetic"></block>
          <block type="math_random_int"></block>
        </category>
        <category name="Events" colour="#9C27B0">
          <block type="controls_flow_statements"></block>
        </category>
      </xml>
    `;

    // Initialize Blockly workspace
    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      toolbox: toolboxRef.current,
      scrollbars: true,
      trashcan: true,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ddd',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      theme: Blockly.Themes.Classic
    });

    // Load initial code if provided
    if (initialCode) {
      try {
        const xml = Blockly.Xml.textToDom(initialCode);
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      } catch (error) {
        console.error("Error loading initial code:", error);
      }
    }

    // Listen for changes
    workspaceRef.current.addChangeListener(() => {
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      if (onCodeChange) {
        onCodeChange(code);
      }
    });

    // Cleanup
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, [onCodeChange, initialCode]);

  const getGeneratedCode = () => {
    if (workspaceRef.current) {
      return javascriptGenerator.workspaceToCode(workspaceRef.current);
    }
    return "";
  };

  const clearWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }
  };

  const loadExample = (exampleName) => {
    if (!workspaceRef.current) return;

    const examples = {
      helloWorld: `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="print_text" x="100" y="100">
            <value name="TEXT">
              <block type="text">
                <field name="TEXT">Hello, Wizard!</field>
              </block>
            </value>
          </block>
        </xml>
      `,
      counter: `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="create_variable" x="100" y="100">
            <field name="NAME">count</field>
            <value name="VALUE">
              <block type="math_number">
                <field name="NUM">0</field>
              </block>
            </value>
          </block>
          <block type="repeat_times" x="100" y="200">
            <value name="TIMES">
              <block type="math_number">
                <field name="NUM">5</field>
              </block>
            </value>
            <statement name="DO">
              <block type="text_print">
                <value name="TEXT">
                  <block type="text_join">
                    <mutation items="2"></mutation>
                    <value name="ADD0">
                      <block type="text">
                        <field name="TEXT">Count: </field>
                      </block>
                    </value>
                    <value name="ADD1">
                      <block type="variables_get">
                        <field name="VAR" id="count">count</field>
                      </block>
                    </value>
                  </block>
                </value>
                <next>
                  <block type="variables_set">
                    <field name="VAR" id="count">count</field>
                    <value name="VALUE">
                      <block type="math_arithmetic">
                        <field name="OP">ADD</field>
                        <value name="A">
                          <block type="variables_get">
                            <field name="VAR" id="count">count</field>
                          </block>
                        </value>
                        <value name="B">
                          <block type="math_number">
                            <field name="NUM">1</field>
                          </block>
                        </value>
                      </block>
                    </value>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </xml>
      `,
      simpleMath: `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="create_variable" x="100" y="100">
            <field name="NAME">a</field>
            <value name="VALUE">
              <block type="math_number">
                <field name="NUM">10</field>
              </block>
            </value>
          </block>
          <block type="create_variable" x="100" y="200">
            <field name="NAME">b</field>
            <value name="VALUE">
              <block type="math_number">
                <field name="NUM">5</field>
              </block>
            </value>
          </block>
          <block type="text_print" x="100" y="300">
            <value name="TEXT">
              <block type="text_join">
                <mutation items="4"></mutation>
                <value name="ADD0">
                  <block type="text">
                    <field name="TEXT">Sum: </field>
                  </block>
                </value>
                <value name="ADD1">
                  <block type="math_arithmetic">
                    <field name="OP">ADD</field>
                    <value name="A">
                      <block type="variables_get">
                        <field name="VAR" id="a">a</field>
                      </block>
                    </value>
                    <value name="B">
                      <block type="variables_get">
                        <field name="VAR" id="b">b</field>
                      </block>
                    </value>
                  </block>
                </value>
                <value name="ADD2">
                  <block type="text">
                    <field name="TEXT">, Difference: </field>
                  </block>
                </value>
                <value name="ADD3">
                  <block type="math_arithmetic">
                    <field name="OP">MINUS</field>
                    <value name="A">
                      <block type="variables_get">
                        <field name="VAR" id="a">a</field>
                      </block>
                    </value>
                    <value name="B">
                      <block type="variables_get">
                        <field name="VAR" id="b">b</field>
                      </block>
                    </value>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </xml>
      `
    };

    if (examples[exampleName]) {
      try {
        const xml = Blockly.Xml.textToDom(examples[exampleName]);
        workspaceRef.current.clear();
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      } catch (error) {
        console.error("Error loading example:", error);
      }
    }
  };

  return (
    <div className="blockly-container">
      <div className="blockly-toolbar">
        <button 
          className="blockly-btn"
          onClick={() => loadExample('helloWorld')}
        >
          👋 Hello World
        </button>
        <button 
          className="blockly-btn"
          onClick={() => loadExample('counter')}
        >
          🔢 Counter
        </button>
        <button 
          className="blockly-btn"
          onClick={() => loadExample('simpleMath')}
        >
          ➕ Simple Math
        </button>
        <button 
          className="blockly-btn clear"
          onClick={clearWorkspace}
        >
          🗑️ Clear
        </button>
      </div>
      <div 
        ref={blocklyDivRef}
        className="blockly-workspace"
      />
      <div className="blockly-help">
        <p>💡 Drag blocks from the toolbox to create your program!</p>
      </div>
    </div>
  );
}