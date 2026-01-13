export const runCodeInBrowser = async (code, language) => {
  return new Promise((resolve) => {
    try {
      let output = '';
      let isHtml = false;
      
      if (language === 'javascript') {
        // Capture console.log output
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const logs = [];
        
        console.log = (...args) => {
          const formatted = args.map(arg => {
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' ');
          logs.push(formatted);
        };
        
        console.error = (...args) => {
          logs.push('[ERROR]: ' + args.join(' '));
        };
        
        try {
          // Wrap in try-catch for safety
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const fn = new AsyncFunction(code);
          fn();
          output = logs.join('\n') || 'Code executed successfully! (No output)';
        } catch (error) {
          output = `❌ JavaScript Error: ${error.message}`;
        } finally {
          console.log = originalConsoleLog;
          console.error = originalConsoleError;
        }
        
        resolve({
          success: true,
          output: output,
          language: language
        });
      }
      else if (language === 'html') {
        // For HTML, wrap in a complete document
        const htmlOutput = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Output</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f9f9ff;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
        output = htmlOutput;
        isHtml = true;
        resolve({
          success: true,
          output: output,
          isHtml: true,
          language: language
        });
      }
      else if (language === 'css') {
        // For CSS, create a sample HTML with the CSS
        const cssOutput = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Output</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f9f9ff;
    }
    ${code}
  </style>
</head>
<body>
  <div class="demo">
    <h1>CSS Output Preview</h1>
    <p>This is a demo paragraph styled by your CSS.</p>
    <button class="btn">Sample Button</button>
  </div>
</body>
</html>`;
        output = cssOutput;
        isHtml = true;
        resolve({
          success: true,
          output: output,
          isHtml: true,
          language: language
        });
      }
      else {
        resolve({
          success: true,
          output: 'Language not supported in browser runner',
          language: language
        });
      }
      
    } catch (error) {
      resolve({
        success: false,
        output: `❌ Error: ${error.message}`,
        language: language
      });
    }
  });
};

export const runCombinedCode = async (htmlCode, cssCode, jsCode) => {
  return new Promise((resolve) => {
    try {
      // Create combined HTML with all code
      const combinedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Page Output</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f9f9ff;
    }
    ${cssCode || ''}
  </style>
</head>
<body>
  ${htmlCode || ''}
  <script>
    // Capture console logs
    const originalConsole = { 
      log: console.log, 
      error: console.error 
    };
    const logs = [];
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalConsole.log(...args);
    };
    
    console.error = (...args) => {
      logs.push('[ERROR]: ' + args.join(' '));
      originalConsole.error(...args);
    };
    
    // Execute JavaScript
    try {
      ${jsCode || ''}
    } catch(error) {
      logs.push('[EXECUTION ERROR]: ' + error.message);
    }
    
    // Display logs
    if (logs.length > 0) {
      const logDiv = document.createElement('div');
      logDiv.style.cssText = 'background: #f0f0f0; padding: 10px; margin-top: 20px; border-radius: 5px; font-family: monospace; border: 1px solid #ddd;';
      logDiv.innerHTML = '<h3 style="margin-top:0;">Console Output:</h3>' + 
        logs.map(log => '<div style="margin: 5px 0;">' + log + '</div>').join('');
      document.body.appendChild(logDiv);
    }
    
    // Restore console
    console.log = originalConsole.log;
    console.error = originalConsole.error;
  </script>
</body>
</html>`;
      
      resolve({
        success: true,
        output: combinedHtml,
        isHtml: true
      });
      
    } catch (error) {
      resolve({
        success: false,
        output: `❌ Error combining code: ${error.message}`
      });
    }
  });
};

export const runPythonOnServer = async (code) => {
  try {
    const response = await fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language: 'python'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      output: `❌ Could not connect to Python server.\n\nMake sure the server is running:\n1. Open terminal in backend folder\n2. Run: node server.js\n3. Make sure Python is installed from python.org\n\nError: ${error.message}`
    };
  }
};