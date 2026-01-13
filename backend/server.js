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
  fs.mkdirSync(tempDir, { recursive: true });
}

// Clean temp directory every hour
setInterval(() => {
  fs.readdir(tempDir, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      try {
        const stat = fs.statSync(filePath);
        const now = new Date().getTime();
        const endTime = new Date(stat.ctime).getTime() + 3600000; // 1 hour
        
        if (now > endTime) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        // Ignore errors
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
      
      fs.writeFileSync(tempFile, safeCode, 'utf8');
      
      exec(`node "${tempFile}"`, { timeout }, (error, stdout, stderr) => {
        // Clean up
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        
        if (error) {
          resolve({ success: false, output: `Error: ${error.message}` });
        } else if (stderr) {
          resolve({ success: false, output: `Error: ${stderr}` });
        } else {
          resolve({ success: true, output: stdout || 'Code executed successfully! (No output)' });
        }
      });
      
    } else if (language === 'python') {
      tempFile = path.join(tempDir, `${id}.py`);
      
      // Simple Python execution without heavy restrictions for learning
      const safeCode = code;
      
      fs.writeFileSync(tempFile, safeCode, 'utf8');
      
      // For Windows, try python, then py
      const commands = [
        'python',    // Most common on Windows
        'py',        // Python launcher on Windows
        'python3'    // Some systems have python3
      ];
      
      let currentCommandIndex = 0;
      
      const tryNextCommand = () => {
        if (currentCommandIndex >= commands.length) {
          // Clean up and return error
          try {
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
          } catch (e) {
            // Ignore cleanup errors
          }
          
          resolve({ 
            success: false, 
            output: `Python is not installed or not in PATH.\n\nPlease install Python from https://www.python.org/downloads/\nMake sure to check "Add Python to PATH" during installation.` 
          });
          return;
        }
        
        const command = commands[currentCommandIndex];
        currentCommandIndex++;
        
        exec(`${command} "${tempFile}"`, { timeout }, (error, stdout, stderr) => {
          if (error) {
            // Try next command
            tryNextCommand();
          } else {
            // Clean up
            try {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
            } catch (e) {
              // Ignore cleanup errors
            }
            
            if (stderr) {
              resolve({ success: false, output: `Error: ${stderr}` });
            } else {
              resolve({ success: true, output: stdout || 'Code executed successfully! (No output)' });
            }
          }
        });
      };
      
      tryNextCommand();
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
    
    console.log(`Running ${language} code...`);
    const result = await runCode(language, code);
    console.log(`Result: ${result.success ? 'Success' : 'Error'}`);
    res.json(result);
    
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Code execution server is running' });
});

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../public')));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Code execution server running on http://localhost:${PORT}`);
  console.log('📝 Endpoints:');
  console.log('  POST /api/run - Execute code');
  console.log('  GET  /api/health - Health check');
});