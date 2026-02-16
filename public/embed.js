/**
 * CFLAR Chatbot Widget Loader
 * This script dynamically loads the chatbot widget with the correct hashed filenames
 * Usage: <script src="https://cflar-chatbot.vercel.app/embed.js"></script>
 */

(function() {
  'use strict';
  
  // Only run once
  if (window.CFLARChatbotLoaded) return;
  window.CFLARChatbotLoaded = true;
  
  const WIDGET_URL = 'https://cflar-chatbot.vercel.app';
  
  // Create the root div for the chatbot
  const root = document.createElement('div');
  root.id = 'cflar-chatbot-root';
  document.body.appendChild(root);
  
  // Fetch the index.html to get the current hashed filenames
  fetch(WIDGET_URL)
    .then(response => response.text())
    .then(html => {
      // Parse the HTML to find script and link tags
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find the CSS file
      const cssLink = doc.querySelector('link[rel="stylesheet"]');
      if (cssLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = WIDGET_URL + cssLink.getAttribute('href');
        document.head.appendChild(link);
      }
      
      // Find the JS module file
      const jsScript = doc.querySelector('script[type="module"]');
      if (jsScript) {
        const script = document.createElement('script');
        script.type = 'module';
        script.crossOrigin = 'anonymous';
        script.src = WIDGET_URL + jsScript.getAttribute('src');
        document.body.appendChild(script);
      }
    })
    .catch(error => {
      console.error('CFLAR Chatbot: Failed to load widget', error);
    });
})();