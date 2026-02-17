import { useState } from 'react';
import knowledgeBaseData from '../src/knowledge-base';

export function KnowledgeBaseTest() {
  const [apiResult, setApiResult] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const testAPI = async () => {
    setApiStatus('loading');
    setApiResult('Testing API endpoint...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'What is the address of CFLAR?' }
          ],
          knowledgeBase: JSON.stringify(knowledgeBaseData)
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      setApiResult(data.message);
      setApiStatus('success');
    } catch (error: any) {
      setApiResult(`Error: ${error.message}`);
      setApiStatus('error');
    }
  };

  const hasKB = knowledgeBaseData && knowledgeBaseData.pages && knowledgeBaseData.pages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#7d401b] mb-2">🧪 CFLAR Chatbot - Knowledge Base Test</h1>
        <p className="text-gray-600 mb-6">This page verifies your knowledge base is loaded correctly.</p>

        {/* Knowledge Base Status */}
        <div className={`p-4 rounded-lg mb-6 ${hasKB ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
          <h2 className="text-xl font-bold mb-2">
            {hasKB ? '✅ Knowledge Base Loaded Successfully!' : '❌ Knowledge Base NOT FOUND'}
          </h2>
          {hasKB && (
            <div className="bg-[#fff2dc] border-2 border-[#7d401b] p-4 rounded-lg mt-4">
              <p className="mb-2"><strong>Pages Indexed:</strong> {knowledgeBaseData.pageCount || 0}</p>
              <p className="mb-2"><strong>Last Updated:</strong> {new Date(knowledgeBaseData.lastUpdated).toLocaleString()}</p>
              <p><strong>Base URL:</strong> {knowledgeBaseData.baseUrl}</p>
            </div>
          )}
        </div>

        {/* Sample Pages */}
        {hasKB && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#7d401b] mb-4">Sample Pages (first 3 of {knowledgeBaseData.pages.length}):</h3>
            <div className="space-y-4">
              {knowledgeBaseData.pages.slice(0, 3).map((page: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-lg">{page.title}</h4>
                  <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {page.url}
                  </a>
                  <p className="text-sm text-gray-700 mt-2">{page.content.substring(0, 200)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Test */}
        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="text-xl font-bold text-[#7d401b] mb-4">Test API Endpoint</h3>
          <button
            onClick={testAPI}
            disabled={apiStatus === 'loading'}
            className="bg-[#7d401b] text-white px-6 py-3 rounded-lg hover:bg-[#8F6A54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {apiStatus === 'loading' ? 'Testing...' : 'Test API with Question'}
          </button>

          {apiResult && (
            <div className={`mt-6 p-4 rounded-lg ${
              apiStatus === 'success' ? 'bg-green-50 border-2 border-green-500' : 
              apiStatus === 'error' ? 'bg-red-50 border-2 border-red-500' : 
              'bg-gray-50 border-2 border-gray-300'
            }`}>
              <h4 className="font-bold mb-2">API Response:</h4>
              <div className="bg-[#fff2dc] border-2 border-[#7d401b] p-4 rounded-lg">
                <p className="mb-2"><strong>Question:</strong> "What is the address of CFLAR?"</p>
                <p><strong>Answer:</strong> {apiResult}</p>
              </div>
              {apiStatus === 'success' && (
                <div className="mt-4 text-sm">
                  {apiResult.includes('500 Broussard') || apiResult.includes('St. Cloud') ? (
                    <p className="text-green-700">✅ <strong>SUCCESS!</strong> The API is using your CFLAR knowledge base correctly!</p>
                  ) : (
                    <p className="text-orange-700">⚠️ <strong>WARNING:</strong> The answer doesn't mention the correct address. The knowledge base might not be reaching the API.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debugging Info */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-bold mb-2">Debugging Checklist:</h4>
          <ul className="space-y-1">
            <li>✅ Knowledge Base File: {hasKB ? `${knowledgeBaseData.pages.length} pages loaded` : 'NOT FOUND'}</li>
            <li>✅ Current URL: {window.location.href}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}