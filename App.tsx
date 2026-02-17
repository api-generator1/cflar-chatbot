import { ChatWidget } from './components/ChatWidget';
import { KnowledgeBaseDebug } from './components/KnowledgeBaseDebug';
import { SystemPromptViewer } from './components/SystemPromptViewer';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#7d401b] mb-4">
            CFLAR Chatbot - Secure Version
          </h1>
          <p className="text-gray-600 mb-2">
            This is a preview of your chatbot widget. The actual widget will appear
            as a floating button on your WordPress site.
          </p>
          <p className="text-sm text-gray-500">
            ✅ API key is stored server-side (secure)<br/>
            ✅ Ready to deploy to Vercel<br/>
            ✅ Easy to embed on WordPress
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-[#7d401b] mb-4">
            Preview Mode
          </h2>
          <p className="text-gray-600 mb-6">
            The chat widget button will appear in the bottom-right corner.
            Click it to test the chatbot.
          </p>
          
          <div className="bg-[#fff2dc] border border-[#8F6A54] rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-[#7d401b] mb-2">⚠️ First Time Setup:</h3>
            <p className="text-gray-700 mb-3">
              The chatbot needs website content to answer questions. Run this command:
            </p>
            <code className="block bg-gray-800 text-green-400 px-4 py-3 rounded text-sm mb-3">
              npm run scrape
            </code>
            <p className="text-sm text-gray-600">
              This will crawl your website and populate the knowledge base.
              See the blue database icon (bottom-left) to check status.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">🧪 Testing Tools:</h3>
            <div className="space-y-2 text-sm text-blue-900">
              <p>• <strong>Purple Eye (Top-Right):</strong> View exact system prompt sent to OpenAI</p>
              <p>• <strong>Blue Database (Bottom-Left):</strong> Check knowledge base status</p>
              <p>• <strong>Browser Console:</strong> See debug logs when you send messages</p>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              💡 If AI gives generic answers, check if knowledge base has 20+ pages loaded
            </p>
          </div>
          
          <div className="bg-[#fff2dc] border border-[#8F6A54] rounded-lg p-6">
            <h3 className="font-semibold text-[#7d401b] mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Push this code to GitHub</li>
              <li>Deploy to Vercel (connects to your GitHub)</li>
              <li>Add your OpenAI API key to Vercel (secure)</li>
              <li>Copy the embed code for WordPress</li>
            </ol>
          </div>
        </div>
      </div>

      {/* The actual chat widget */}
      <ChatWidget />
      
      {/* Debug panel - remove this before deploying to production */}
      <KnowledgeBaseDebug />
      
      {/* System prompt viewer - remove this before deploying to production */}
      <SystemPromptViewer />
    </div>
  );
}