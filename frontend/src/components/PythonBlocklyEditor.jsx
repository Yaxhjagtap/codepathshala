import { useEffect, useRef, useState, useCallback } from "react";
import * as Blockly from "blockly";
import { pythonGenerator } from "blockly/python";
import "blockly/blocks";
import "blockly/msg/en";

// Track initialization state
let isInitialized = false;
let initializedAgeGroups = [];

// Function to check if we should initialize blocks
const shouldInitializeBlocks = (ageGroup) => {
  if (!isInitialized) {
    isInitialized = true;
    initializedAgeGroups = [ageGroup];
    return true;
  }
  
  if (!initializedAgeGroups.includes(ageGroup)) {
    initializedAgeGroups.push(ageGroup);
    return true;
  }
  
  return false;
};

// Define common blocks (only once)
const defineCommonBlocks = () => {
  if (window.commonBlocksDefined) return;
  
  // Don't clear existing generators to avoid breaking other blocks
  // Only define if they don't exist
  const existingBlocks = Blockly.Blocks;
  
  if (!existingBlocks['print_text']) {
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "print_text",
        "message0": "print %1",
        "args0": [
          {
            "type": "input_value",
            "name": "TEXT",
            "check": ["String", "Number", "Boolean"]
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Print text or values to console"
      }
    ]);
  }

  if (!existingBlocks['text']) {
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "text",
        "message0": "\"%1\"",
        "args0": [
          {
            "type": "field_input",
            "name": "TEXT",
            "text": "Hello"
          }
        ],
        "output": "String",
        "colour": 160,
        "tooltip": "Text value"
      }
    ]);
  }

  if (!existingBlocks['math_number']) {
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "math_number",
        "message0": "%1",
        "args0": [
          {
            "type": "field_number",
            "name": "NUM",
            "value": 0
          }
        ],
        "output": "Number",
        "colour": 230,
        "tooltip": "Number value"
      }
    ]);
  }

  if (!existingBlocks['logic_boolean']) {
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "logic_boolean",
        "message0": "%1",
        "args0": [
          {
            "type": "field_dropdown",
            "name": "BOOL",
            "options": [
              ["True", "True"],
              ["False", "False"]
            ]
          }
        ],
        "output": "Boolean",
        "colour": 210,
        "tooltip": "Boolean value"
      }
    ]);
  }

  if (!existingBlocks['math_arithmetic']) {
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "math_arithmetic",
        "message0": "%1 %2 %3",
        "args0": [
          {
            "type": "input_value",
            "name": "A",
            "check": "Number"
          },
          {
            "type": "field_dropdown",
            "name": "OP",
            "options": [
              ["+", "+"],
              ["-", "-"],
              ["×", "*"],
              ["÷", "/"]
            ]
          },
          {
            "type": "input_value",
            "name": "B",
            "check": "Number"
          }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": 230,
        "tooltip": "Mathematical operations"
      }
    ]);
  }

  window.commonBlocksDefined = true;
};

// Define common generators (only once)
const defineCommonGenerators = () => {
  if (window.commonGeneratorsDefined) return;

  // Common generators
  if (!pythonGenerator.forBlock['print_text']) {
    pythonGenerator.forBlock['print_text'] = function(block) {
      const text = pythonGenerator.valueToCode(block, 'TEXT', pythonGenerator.ORDER_NONE) || '""';
      return `print(${text})\n`;
    };
  }

  if (!pythonGenerator.forBlock['text']) {
    pythonGenerator.forBlock['text'] = function(block) {
      const text = block.getFieldValue('TEXT');
      return [`"${text}"`, pythonGenerator.ORDER_ATOMIC];
    };
  }

  if (!pythonGenerator.forBlock['math_number']) {
    pythonGenerator.forBlock['math_number'] = function(block) {
      const number = block.getFieldValue('NUM');
      return [number, pythonGenerator.ORDER_ATOMIC];
    };
  }

  if (!pythonGenerator.forBlock['logic_boolean']) {
    pythonGenerator.forBlock['logic_boolean'] = function(block) {
      const bool = block.getFieldValue('BOOL');
      return [bool, pythonGenerator.ORDER_ATOMIC];
    };
  }

  if (!pythonGenerator.forBlock['math_arithmetic']) {
    pythonGenerator.forBlock['math_arithmetic'] = function(block) {
      const operator = block.getFieldValue('OP');
      const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_ADDITIVE) || '0';
      const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_ADDITIVE) || '0';
      
      return [`(${a} ${operator} ${b})`, pythonGenerator.ORDER_ATOMIC];
    };
  }

  window.commonGeneratorsDefined = true;
};

// Age-specific blocks and generators
const defineAgeSpecificBlocksAndGenerators = (ageGroup) => {
  if (ageGroup === "6-8") {
    // 6-8 blocks
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "say_hello",
        "message0": "say hello",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Say hello"
      },
      {
        "type": "count_to",
        "message0": "count to %1",
        "args0": [
          {
            "type": "input_value",
            "name": "NUMBER",
            "check": "Number"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Count to a number"
      },
      {
        "type": "create_name",
        "message0": "create name %1",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "friend"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "Create a name"
      }
    ]);

    // 6-8 generators
    pythonGenerator.forBlock['say_hello'] = function(block) {
      return 'print("Hello!")\n';
    };

    pythonGenerator.forBlock['count_to'] = function(block) {
      const number = pythonGenerator.valueToCode(block, 'NUMBER', pythonGenerator.ORDER_NONE) || '5';
      return `for i in range(1, ${number} + 1):\n  print(i)\n`;
    };

    pythonGenerator.forBlock['create_name'] = function(block) {
      const name = block.getFieldValue('NAME');
      return `${name} = "friend"\nprint("Hello", ${name})\n`;
    };

  } else if (ageGroup === "9-11") {
    // 9-11 blocks
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "variables_set",
        "message0": "set %1 to %2",
        "args0": [
          {
            "type": "field_variable",
            "name": "VAR",
            "variable": "item"
          },
          {
            "type": "input_value",
            "name": "VALUE"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "Set a variable"
      },
      {
        "type": "variables_get",
        "message0": "%1",
        "args0": [
          {
            "type": "field_variable",
            "name": "VAR",
            "variable": "item"
          }
        ],
        "output": null,
        "colour": 160,
        "tooltip": "Get a variable"
      },
      {
        "type": "controls_repeat",
        "message0": "repeat %1 times %2",
        "args0": [
          {
            "type": "input_value",
            "name": "TIMES",
            "check": "Number"
          },
          {
            "type": "input_statement",
            "name": "DO"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Repeat actions multiple times"
      },
      {
        "type": "controls_if",
        "message0": "if %1 do %2",
        "args0": [
          {
            "type": "input_value",
            "name": "IF0",
            "check": "Boolean"
          },
          {
            "type": "input_statement",
            "name": "DO0"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "If condition is true, do something"
      },
      {
        "type": "logic_compare",
        "message0": "%1 %2 %3",
        "args0": [
          {
            "type": "input_value",
            "name": "A"
          },
          {
            "type": "field_dropdown",
            "name": "OP",
            "options": [
              ["=", "=="],
              ["≠", "!="],
              ["<", "<"],
              ["≤", "<="],
              [">", ">"],
              ["≥", ">="]
            ]
          },
          {
            "type": "input_value",
            "name": "B"
          }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "colour": 210,
        "tooltip": "Compare two values"
      }
    ]);

    // 9-11 generators
    pythonGenerator.forBlock['variables_set'] = function(block) {
      const variable = block.getFieldValue('VAR');
      const value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_NONE) || '""';
      return `${variable} = ${value}\n`;
    };

    pythonGenerator.forBlock['variables_get'] = function(block) {
      const variable = block.getFieldValue('VAR');
      return [variable, pythonGenerator.ORDER_ATOMIC];
    };

    pythonGenerator.forBlock['controls_repeat'] = function(block) {
      const times = pythonGenerator.valueToCode(block, 'TIMES', pythonGenerator.ORDER_NONE) || '0';
      const branch = pythonGenerator.statementToCode(block, 'DO');
      const indentedBranch = branch ? branch.replace(/^/gm, '  ') : '  pass';
      return `for i in range(${times}):\n${indentedBranch}\n`;
    };

    pythonGenerator.forBlock['controls_if'] = function(block) {
      const condition = pythonGenerator.valueToCode(block, 'IF0', pythonGenerator.ORDER_NONE) || 'False';
      const branch = pythonGenerator.statementToCode(block, 'DO0');
      const indentedBranch = branch ? branch.replace(/^/gm, '  ') : '  pass';
      return `if ${condition}:\n${indentedBranch}\n`;
    };

    pythonGenerator.forBlock['logic_compare'] = function(block) {
      const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_RELATIONAL) || '0';
      const op = block.getFieldValue('OP');
      const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_RELATIONAL) || '0';
      return [`(${a} ${op} ${b})`, pythonGenerator.ORDER_RELATIONAL];
    };

  } else if (ageGroup === "12-14" || ageGroup === "15-16") {
    // 12-14/15-16 blocks
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "variables_set",
        "message0": "set %1 to %2",
        "args0": [
          {
            "type": "field_variable",
            "name": "VAR",
            "variable": "item"
          },
          {
            "type": "input_value",
            "name": "VALUE"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "Set a variable"
      },
      {
        "type": "variables_get",
        "message0": "%1",
        "args0": [
          {
            "type": "field_variable",
            "name": "VAR",
            "variable": "item"
          }
        ],
        "output": null,
        "colour": 160,
        "tooltip": "Get a variable"
      },
      {
        "type": "controls_while",
        "message0": "while %1 do %2",
        "args0": [
          {
            "type": "input_value",
            "name": "CONDITION",
            "check": "Boolean"
          },
          {
            "type": "input_statement",
            "name": "DO"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "While condition is true, do something"
      },
      {
        "type": "controls_repeat",
        "message0": "repeat %1 times %2",
        "args0": [
          {
            "type": "input_value",
            "name": "TIMES",
            "check": "Number"
          },
          {
            "type": "input_statement",
            "name": "DO"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Repeat actions multiple times"
      },
      {
        "type": "controls_if",
        "message0": "if %1 do %2",
        "args0": [
          {
            "type": "input_value",
            "name": "IF0",
            "check": "Boolean"
          },
          {
            "type": "input_statement",
            "name": "DO0"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 210,
        "tooltip": "If condition is true, do something"
      },
      {
        "type": "logic_compare",
        "message0": "%1 %2 %3",
        "args0": [
          {
            "type": "input_value",
            "name": "A"
          },
          {
            "type": "field_dropdown",
            "name": "OP",
            "options": [
              ["=", "=="],
              ["≠", "!="],
              ["<", "<"],
              ["≤", "<="],
              [">", ">"],
              ["≥", ">="]
            ]
          },
          {
            "type": "input_value",
            "name": "B"
          }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "colour": 210,
        "tooltip": "Compare two values"
      },
      {
        "type": "logic_operation",
        "message0": "%1 %2 %3",
        "args0": [
          {
            "type": "input_value",
            "name": "A",
            "check": "Boolean"
          },
          {
            "type": "field_dropdown",
            "name": "OP",
            "options": [
              ["and", "and"],
              ["or", "or"]
            ]
          },
          {
            "type": "input_value",
            "name": "B",
            "check": "Boolean"
          }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "colour": 210,
        "tooltip": "Logical operations"
      },
      {
        "type": "procedures_defnoreturn",
        "message0": "def %1() %2",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "function_name"
          },
          {
            "type": "input_statement",
            "name": "STACK"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 290,
        "tooltip": "Define a function"
      },
      {
        "type": "procedures_callnoreturn",
        "message0": "call %1()",
        "args0": [
          {
            "type": "field_input",
            "name": "NAME",
            "text": "function_name"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 290,
        "tooltip": "Call a function"
      },
      {
        "type": "lists_create_with",
        "message0": "list %1",
        "args0": [
          {
            "type": "input_dummy"
          }
        ],
        "output": "Array",
        "colour": 260,
        "tooltip": "Create a list"
      }
    ]);

    // 12-14/15-16 generators
    pythonGenerator.forBlock['variables_set'] = function(block) {
      const variable = block.getFieldValue('VAR');
      const value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_NONE) || '""';
      return `${variable} = ${value}\n`;
    };

    pythonGenerator.forBlock['variables_get'] = function(block) {
      const variable = block.getFieldValue('VAR');
      return [variable, pythonGenerator.ORDER_ATOMIC];
    };

    pythonGenerator.forBlock['controls_while'] = function(block) {
      const condition = pythonGenerator.valueToCode(block, 'CONDITION', pythonGenerator.ORDER_NONE) || 'False';
      const branch = pythonGenerator.statementToCode(block, 'DO');
      const indentedBranch = branch ? branch.replace(/^/gm, '  ') : '  pass';
      return `while ${condition}:\n${indentedBranch}\n`;
    };

    pythonGenerator.forBlock['controls_repeat'] = function(block) {
      const times = pythonGenerator.valueToCode(block, 'TIMES', pythonGenerator.ORDER_NONE) || '0';
      const branch = pythonGenerator.statementToCode(block, 'DO');
      const indentedBranch = branch ? branch.replace(/^/gm, '  ') : '  pass';
      return `for i in range(${times}):\n${indentedBranch}\n`;
    };

    pythonGenerator.forBlock['controls_if'] = function(block) {
      const condition = pythonGenerator.valueToCode(block, 'IF0', pythonGenerator.ORDER_NONE) || 'False';
      const branch = pythonGenerator.statementToCode(block, 'DO0');
      const indentedBranch = branch ? branch.replace(/^/gm, '  ') : '  pass';
      return `if ${condition}:\n${indentedBranch}\n`;
    };

    pythonGenerator.forBlock['logic_compare'] = function(block) {
      const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_RELATIONAL) || '0';
      const op = block.getFieldValue('OP');
      const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_RELATIONAL) || '0';
      return [`(${a} ${op} ${b})`, pythonGenerator.ORDER_RELATIONAL];
    };

    pythonGenerator.forBlock['logic_operation'] = function(block) {
      const a = pythonGenerator.valueToCode(block, 'A', pythonGenerator.ORDER_LOGICAL) || 'False';
      const op = block.getFieldValue('OP');
      const b = pythonGenerator.valueToCode(block, 'B', pythonGenerator.ORDER_LOGICAL) || 'False';
      return [`(${a} ${op} ${b})`, pythonGenerator.ORDER_LOGICAL];
    };

    pythonGenerator.forBlock['procedures_defnoreturn'] = function(block) {
      const name = block.getFieldValue('NAME');
      const branch = pythonGenerator.statementToCode(block, 'STACK');
      const indentedBranch = branch ? branch.replace(/^/gm, '  ') : '  pass';
      return `def ${name}():\n${indentedBranch}\n`;
    };

    pythonGenerator.forBlock['procedures_callnoreturn'] = function(block) {
      const name = block.getFieldValue('NAME');
      return `${name}()\n`;
    };

    pythonGenerator.forBlock['lists_create_with'] = function(block) {
      return ['[]', pythonGenerator.ORDER_ATOMIC];
    };
  }
};

// Main initialization function
const initializeBlocklyForAgeGroup = (ageGroup) => {
  // Check if we need to initialize
  if (!shouldInitializeBlocks(ageGroup)) {
    return;
  }

  // Define common blocks and generators (only once)
  defineCommonBlocks();
  defineCommonGenerators();
  
  // Define age-specific blocks and generators
  defineAgeSpecificBlocksAndGenerators(ageGroup);
};

const getToolboxForAge = (ageGroup) => {
  if (ageGroup === "6-8") {
    return {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Basics",
          colour: "#FF6B6B",
          contents: [
            { kind: "block", type: "say_hello" },
            { kind: "block", type: "print_text" },
            { kind: "block", type: "text" },
            { kind: "block", type: "math_number" }
          ]
        },
        {
          kind: "category",
          name: "Fun",
          colour: "#4ECDC4",
          contents: [
            { kind: "block", type: "count_to" },
            { kind: "block", type: "create_name" }
          ]
        },
        {
          kind: "category",
          name: "Math",
          colour: "#FFD166",
          contents: [
            { kind: "block", type: "math_arithmetic" }
          ]
        }
      ]
    };
  } else if (ageGroup === "9-11") {
    return {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Output",
          colour: "#FF6B6B",
          contents: [
            { kind: "block", type: "print_text" }
          ]
        },
        {
          kind: "category",
          name: "Values",
          colour: "#4ECDC4",
          contents: [
            { kind: "block", type: "text" },
            { kind: "block", type: "math_number" },
            { kind: "block", type: "logic_boolean" }
          ]
        },
        {
          kind: "category",
          name: "Variables",
          colour: "#06D6A0",
          contents: [
            { kind: "block", type: "variables_set" },
            { kind: "block", type: "variables_get" }
          ]
        },
        {
          kind: "category",
          name: "Loops",
          colour: "#118AB2",
          contents: [
            { kind: "block", type: "controls_repeat" }
          ]
        },
        {
          kind: "category",
          name: "Logic",
          colour: "#EF476F",
          contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "logic_compare" }
          ]
        },
        {
          kind: "category",
          name: "Math",
          colour: "#FFD166",
          contents: [
            { kind: "block", type: "math_arithmetic" }
          ]
        }
      ]
    };
  } else {
    // 12-14 and 15-16
    return {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Output",
          colour: "#FF6B6B",
          contents: [
            { kind: "block", type: "print_text" }
          ]
        },
        {
          kind: "category",
          name: "Values",
          colour: "#4ECDC4",
          contents: [
            { kind: "block", type: "text" },
            { kind: "block", type: "math_number" },
            { kind: "block", type: "logic_boolean" }
          ]
        },
        {
          kind: "category",
          name: "Variables",
          colour: "#06D6A0",
          contents: [
            { kind: "block", type: "variables_set" },
            { kind: "block", type: "variables_get" }
          ]
        },
        {
          kind: "category",
          name: "Loops",
          colour: "#118AB2",
          contents: [
            { kind: "block", type: "controls_repeat" },
            { kind: "block", type: "controls_while" }
          ]
        },
        {
          kind: "category",
          name: "Logic",
          colour: "#EF476F",
          contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" }
          ]
        },
        {
          kind: "category",
          name: "Functions",
          colour: "#7209B7",
          contents: [
            { kind: "block", type: "procedures_defnoreturn" },
            { kind: "block", type: "procedures_callnoreturn" }
          ]
        },
        {
          kind: "category",
          name: "Math",
          colour: "#FFD166",
          contents: [
            { kind: "block", type: "math_arithmetic" }
          ]
        },
        {
          kind: "category",
          name: "Lists",
          colour: "#F72585",
          contents: [
            { kind: "block", type: "lists_create_with" }
          ]
        }
      ]
    };
  }
};

export default function PythonBlocklyEditor({ onCodeChange, initialCode = "", ageGroup = "9-11", currentLab = null }) {
  const blocklyDivRef = useRef(null);
  const workspaceRef = useRef(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [workspaceReady, setWorkspaceReady] = useState(false);

  // Function to update code from workspace
  const updateCodeFromWorkspace = useCallback(() => {
    if (workspaceRef.current && pythonGenerator) {
      try {
        const code = pythonGenerator.workspaceToCode(workspaceRef.current);
        setGeneratedCode(code);
        if (onCodeChange) {
          onCodeChange(code);
        }
      } catch (error) {
        console.error("Error generating code:", error);
      }
    }
  }, [onCodeChange]);

  // Function to load XML into workspace
  const loadXmlToWorkspace = useCallback((xmlString) => {
    if (!workspaceRef.current) return;
    
    try {
      // Parse XML string
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Clear workspace and load new XML
      workspaceRef.current.clear();
      Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspaceRef.current);
      
      // Update code
      updateCodeFromWorkspace();
    } catch (error) {
      console.error("Error loading XML:", error);
    }
  }, [updateCodeFromWorkspace]);

  useEffect(() => {
    if (!blocklyDivRef.current) return;

    // Initialize Blockly for this age group
    initializeBlocklyForAgeGroup(ageGroup);

    // Define toolbox based on age
    const toolbox = getToolboxForAge(ageGroup);

    // Initialize Blockly workspace
    workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
      toolbox: toolbox,
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
      theme: Blockly.Themes.Classic,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true
      }
    });

    // Set up workspace change listener
    workspaceRef.current.addChangeListener((event) => {
      if (!event.isUiEvent) {
        updateCodeFromWorkspace();
      }
    });

    // Load initial content
    const loadInitialContent = () => {
      try {
        const defaultXml = `
          <xml xmlns="https://developers.google.com/blockly/xml">
            <block type="print_text" x="100" y="100">
              <value name="TEXT">
                <block type="text">
                  <field name="TEXT">Hello from Python Blockly!</field>
                </block>
              </value>
            </block>
          </xml>
        `;
        loadXmlToWorkspace(defaultXml);
      } catch (error) {
        console.error("Error loading initial content:", error);
      }
      setWorkspaceReady(true);
    };

    // Load lab-specific examples
    if (currentLab) {
      loadLabExample(currentLab.id);
      setWorkspaceReady(true);
    } else {
      loadInitialContent();
    }

    // Initial code generation
    setTimeout(() => {
      updateCodeFromWorkspace();
      setIsInitialized(true);
    }, 100);

    // Cleanup
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        setIsInitialized(false);
        setWorkspaceReady(false);
      }
    };
  }, [ageGroup, currentLab, updateCodeFromWorkspace, loadXmlToWorkspace]);

  const loadLabExample = useCallback((labId) => {
    if (!workspaceRef.current) return;

    const examples = {
      "lab_1": `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="print_text" x="100" y="100">
            <value name="TEXT">
              <block type="text">
                <field name="TEXT">Hello, Python Coder!</field>
              </block>
            </value>
          </block>
        </xml>
      `,
      "lab_2": `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="variables_set" x="100" y="100">
            <field name="VAR">name</field>
            <value name="VALUE">
              <block type="text">
                <field name="TEXT">Python Learner</field>
              </block>
            </value>
            <next>
              <block type="print_text">
                <value name="TEXT">
                  <block type="variables_get">
                    <field name="VAR">name</field>
                  </block>
                </value>
              </block>
            </next>
          </block>
        </xml>
      `,
      "lab_3": `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="controls_repeat" x="100" y="100">
            <value name="TIMES">
              <block type="math_number">
                <field name="NUM">3</field>
              </block>
            </value>
            <statement name="DO">
              <block type="print_text">
                <value name="TEXT">
                  <block type="text">
                    <field name="TEXT">Loop iteration</field>
                  </block>
                </value>
              </block>
            </statement>
          </block>
        </xml>
      `
    };

    if (examples[labId]) {
      loadXmlToWorkspace(examples[labId]);
    }
  }, [loadXmlToWorkspace]);

  const clearWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      setGeneratedCode("");
      if (onCodeChange) {
        onCodeChange("");
      }
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
                <field name="TEXT">Hello, Python World!</field>
              </block>
            </value>
          </block>
        </xml>
      `,
      variables: `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="variables_set" x="100" y="100">
            <field name="VAR">score</field>
            <value name="VALUE">
              <block type="math_number">
                <field name="NUM">100</field>
              </block>
            </value>
          </block>
        </xml>
      `,
      loop: `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="controls_repeat" x="100" y="100">
            <value name="TIMES">
              <block type="math_number">
                <field name="NUM">5</field>
              </block>
            </value>
            <statement name="DO">
              <block type="print_text">
                <value name="TEXT">
                  <block type="text">
                    <field name="TEXT">Python is awesome!</field>
                  </block>
                </value>
              </block>
            </statement>
          </block>
        </xml>
      `,
      math: `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="variables_set" x="100" y="100">
            <field name="VAR">result</field>
            <value name="VALUE">
              <block type="math_arithmetic">
                <value name="A">
                  <block type="math_number">
                    <field name="NUM">10</field>
                  </block>
                </value>
                <value name="B">
                  <block type="math_number">
                    <field name="NUM">5</field>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </xml>
      `
    };

    if (examples[exampleName]) {
      loadXmlToWorkspace(examples[exampleName]);
    }
  };

  // Manual update button in case real-time updates fail
  const manuallyUpdateCode = () => {
    updateCodeFromWorkspace();
  };

  return (
    <div className="python-blockly-container">
      <div className="blockly-toolbar">
        <button 
          className="blockly-btn"
          onClick={() => loadExample('helloWorld')}
          disabled={!workspaceReady}
        >
          👋 Hello World
        </button>
        <button 
          className="blockly-btn"
          onClick={() => loadExample('variables')}
          disabled={!workspaceReady}
        >
          🔢 Variables
        </button>
        <button 
          className="blockly-btn"
          onClick={() => loadExample('loop')}
          disabled={!workspaceReady}
        >
          🔁 Loop
        </button>
        <button 
          className="blockly-btn"
          onClick={() => loadExample('math')}
          disabled={!workspaceReady}
        >
          ➕ Math
        </button>
        <button 
          className="blockly-btn"
          onClick={manuallyUpdateCode}
          title="Force update Python code"
          disabled={!workspaceReady}
        >
          🔄 Update Code
        </button>
        <button 
          className="blockly-btn clear"
          onClick={clearWorkspace}
          disabled={!workspaceReady}
        >
          🗑️ Clear
        </button>
      </div>
      <div 
        ref={blocklyDivRef}
        className="python-blockly-workspace"
        style={{ width: "100%", height: "400px" }}
      />
      <div className="blockly-preview">
        <div className="preview-header">
          <h4>Generated Python Code:</h4>
          <button 
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(generatedCode);
            }}
            disabled={!generatedCode}
          >
            📋 Copy
          </button>
        </div>
        <pre className="generated-code">
          {generatedCode || "# Drag blocks or use examples to generate Python code"}
        </pre>
        <div className="preview-info">
          <p>📝 This code will be executed when you click "Run Code"</p>
          {!workspaceReady && <p className="loading-text">⏳ Initializing Blockly workspace...</p>}
        </div>
      </div>
      <div className="blockly-help">
        <p>🧩 Drag blocks from the toolbox to create your Python program!</p>
        <p>👶 Age Group: {ageGroup} years - Learning appropriate Python concepts</p>
        <p>⚡ Tip: Code updates automatically as you drag blocks</p>
      </div>
    </div>
  );
}