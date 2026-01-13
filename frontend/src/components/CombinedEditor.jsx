import { useState } from "react";

export default function CombinedEditor({ htmlCode, setHtmlCode, cssCode, setCssCode, jsCode, setJsCode }) {
  const [activeTab, setActiveTab] = useState("html");
  
  const getCode = () => {
    switch(activeTab) {
      case "html": return htmlCode;
      case "css": return cssCode;
      case "js": return jsCode;
      default: return "";
    }
  };
  
  const setCode = (value) => {
    switch(activeTab) {
      case "html": setHtmlCode(value); break;
      case "css": setCssCode(value); break;
      case "js": setJsCode(value); break;
    }
  };
  
  const getCombinedOutput = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Page</title>
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
    try {
      ${jsCode || ''}
    } catch(error) {
      console.error("JavaScript Error:", error);
    }
  </script>
</body>
</html>`;
  };

  return (
    <div className="combined-editor">
      <div className="code-tabs">
        <button 
          className={`code-tab ${activeTab === "html" ? "active" : ""}`}
          onClick={() => setActiveTab("html")}
        >
          🌐 HTML
        </button>
        <button 
          className={`code-tab ${activeTab === "css" ? "active" : ""}`}
          onClick={() => setActiveTab("css")}
        >
          🎨 CSS
        </button>
        <button 
          className={`code-tab ${activeTab === "js" ? "active" : ""}`}
          onClick={() => setActiveTab("js")}
        >
          ⚡ JavaScript
        </button>
      </div>
      
      <div className="combined-editor-content">
        <textarea
          className="code-area"
          value={getCode()}
          onChange={(e) => setCode(e.target.value)}
          placeholder={
            activeTab === "html" ? "Write your HTML here..." :
            activeTab === "css" ? "Write your CSS here..." :
            "Write your JavaScript here..."
          }
          spellCheck="false"
          rows={15}
        />
      </div>
      
      <div className="editor-tips">
        {activeTab === "html" && (
          <>
            <h4>💡 HTML Tips:</h4>
            <ul>
              <li>Use &lt;h1&gt; to &lt;h6&gt; for headings</li>
              <li>Use &lt;p&gt; for paragraphs</li>
              <li>Use &lt;div&gt; to group elements</li>
              <li>Add classes with class="name" for CSS styling</li>
            </ul>
          </>
        )}
        {activeTab === "css" && (
          <>
            <h4>💡 CSS Tips:</h4>
            <ul>
              <li>Target elements by tag name: h1 &#123; color: red; &#125;</li>
              <li>Target by class: .my-class &#123; font-size: 16px; &#125;</li>
              <li>Target by id: #my-id &#123; background: blue; &#125;</li>
              <li>Use hex colors: #6c63ff for purple</li>
            </ul>
          </>
        )}
        {activeTab === "js" && (
          <>
            <h4>💡 JavaScript Tips:</h4>
            <ul>
              <li>Use console.log() to print to console</li>
              <li>Variables: let name = "value";</li>
              <li>Functions: function myFunction() &#123; ... &#125;</li>
              <li>Events: element.onclick = function() &#123; ... &#125;</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}