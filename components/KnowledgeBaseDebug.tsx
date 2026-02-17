import { useState, useEffect } from 'react';
import { Database, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
// Import knowledge base directly as a module
import knowledgeBaseData from '../src/knowledge-base';

export function KnowledgeBaseDebug() {
  const [knowledgeBase, setKnowledgeBase] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false); // Changed from true since we load synchronously
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = () => {
    if (knowledgeBaseData) {
      setKnowledgeBase(knowledgeBaseData);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
          title="Knowledge Base Debug"
        >
          <Database size={24} />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl p-6 w-[400px] max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database size={20} />
              Knowledge Base Debug
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <div className="flex items-center gap-2 mb-2">
                  {knowledgeBase ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <AlertCircle className="text-red-600" size={20} />
                  )}
                  <span className="font-semibold">
                    Status: {knowledgeBase ? 'Loaded' : 'Not Found'}
                  </span>
                </div>
                {knowledgeBase && (
                  <div className="text-sm space-y-1">
                    <p><strong>Last Updated:</strong> {new Date(knowledgeBase.lastUpdated).toLocaleString()}</p>
                    <p><strong>Pages Indexed:</strong> {knowledgeBase.pageCount || 0}</p>
                    <p><strong>Base URL:</strong> {knowledgeBase.baseUrl}</p>
                  </div>
                )}
              </div>

              {knowledgeBase && knowledgeBase.pages && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Indexed Pages:</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {knowledgeBase.pages.map((page: any, idx: number) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                        <p className="font-semibold text-blue-600 truncate">{page.title}</p>
                        <p className="text-gray-500 text-xs truncate">{page.url}</p>
                        <p className="text-gray-600 mt-1 line-clamp-2">{page.content.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-3 space-y-2 bg-blue-50 border border-blue-200 rounded p-3">
                <p className="font-semibold text-blue-800 mb-1">💡 How to Update Knowledge Base:</p>
                <p className="text-blue-700 mb-2">
                  To scrape your website and update the knowledge base, run this command in your terminal:
                </p>
                <code className="bg-gray-800 text-green-400 px-2 py-1 rounded block text-center">
                  npm run scrape
                </code>
                <p className="text-blue-600 text-xs mt-2">
                  This will crawl https://cflar.dream.press and save the data to /src/knowledge-base.ts
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}