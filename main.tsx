import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ChatWidget } from './components/ChatWidget';
import './styles/globals.css';

// Check if we're in WordPress embed mode or preview mode
const embedRoot = document.getElementById('cflar-chatbot-root');
const previewRoot = document.getElementById('root');

if (embedRoot) {
  // WordPress embed mode - render just the widget
  createRoot(embedRoot).render(
    <StrictMode>
      <ChatWidget />
    </StrictMode>
  );
} else if (previewRoot) {
  // Preview mode - render full app
  createRoot(previewRoot).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}