const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Clean temp directory every hour
setInterval(() => {
  fs.readdir(tempDir, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stat = fs.statSync(filePath);
      const now = new Date().getTime();
      const endTime = new Date(stat.ctime).getTime() + 3600000; // 1 hour
      
      if (now > endTime) {
        fs.unlinkSync(filePath);
      }
    });
  });
}, 3600000);

// Helper function to run code safely
const runCode = (language, code, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    let tempFile;
    
    if (language === 'javascript') {
      tempFile = path.join(tempDir, `${id}.js`);
      
      // Add safety wrapper for JavaScript
      const safeCode = `
// Safe execution wrapper
(function() {
  "use strict";
  
  // Block dangerous functions
  const blocked = ['eval', 'Function', 'process', 'require', 'global', 'module', 'exports', '__dirname', '__filename'];
  blocked.forEach(name => {
    Object.defineProperty(globalThis, name, {
      get: () => { throw new Error('${name} is not allowed'); },
      configurable: false
    });
  });
  
  // Override console methods
  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => {
    logs.push(args.join(' '));
  };
  
  const originalError = console.error;
  console.error = (...args) => {
    logs.push('[ERROR]: ' + args.join(' '));
  };
  
  try {
    ${code}
  } catch (error) {
    logs.push('[EXECUTION ERROR]: ' + error.message);
  }
  
  // Restore original console
  console.log = originalLog;
  console.error = originalError;
  
  // Return logs
  return logs.join('\\n');
})();
      `;
      
      fs.writeFileSync(tempFile, safeCode);
      
      exec(`node "${tempFile}"`, { timeout }, (error, stdout, stderr) => {
        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        
        if (error) {
          resolve({ output: `Error: ${error.message}`, success: false });
        } else if (stderr) {
          resolve({ output: `Error: ${stderr}`, success: false });
        } else {
          resolve({ output: stdout || 'Code executed successfully! (No output)', success: true });
        }
      });
      
    } else if (language === 'python') {
      tempFile = path.join(tempDir, `${id}.py`);
      
      // Add safety measures for Python
      const safeCode = `import sys
import os

# Block dangerous modules
dangerous_modules = ['os', 'sys', 'subprocess', 'shutil', 'socket']
for mod in dangerous_modules:
    sys.modules[mod] = None

# Safe execution
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"[ERROR]: {str(e)}")
`;
      
      fs.writeFileSync(tempFile, safeCode);
      
      exec(`python3 "${tempFile}"`, { timeout }, (error, stdout, stderr) => {
        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        
        if (error) {
          resolve({ output: `Error: ${error.message}`, success: false });
        } else if (stderr) {
          resolve({ output: `Error: ${stderr}`, success: false });
        } else {
          resolve({ output: stdout || 'Code executed successfully! (No output)', success: true });
        }
      });
    } else {
      reject(new Error('Unsupported language'));
    }
  });
};

// Routes
app.post('/api/run', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    if (!['javascript', 'python'].includes(language)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }
    
    const result = await runCode(language, code);
    res.json(result);
    
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Code execution server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Code execution server running on port ${PORT}`);
});