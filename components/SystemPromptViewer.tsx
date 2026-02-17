import { useState, useEffect } from 'react';
import { Eye, X, Copy, Check } from 'lucide-react';
// Import knowledge base directly as a module
import knowledgeBaseData from '../src/knowledge-base';

export function SystemPromptViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    try {
      // Use the imported module directly
      setKnowledgeBase(knowledgeBaseData);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      // Set fallback empty knowledge base
      setKnowledgeBase({
        lastUpdated: new Date().toISOString(),
        baseUrl: 'https://cflar.dream.press',
        pageCount: 0,
        pages: []
      });
    }
  };

  const formatKnowledgeBase = () => {
    if (!knowledgeBase || !knowledgeBase.pages) {
      return 'No knowledge base loaded';
    }

    return knowledgeBase.pages.map((page: any) => {
      return `
PAGE: ${page.title}
URL: ${page.url}
CONTENT: ${page.content}
HEADINGS: ${page.headings.join(', ')}
---`;
    }).join('\n\n');
  };

  const getFullSystemPrompt = () => {
    const formattedKB = formatKnowledgeBase();
    
    return `You are a helpful AI website assistant for the Central Florida Animal Reserve (CFLAR), a non-profit big cat reserve in St. Cloud, FL.

IMPORTANT INSTRUCTIONS:
1. Provide detailed, helpful answers based on the knowledge base below
2. When relevant, include specific URLs for actions users might want to take
3. Be warm, educational, and enthusiastic about big cat conservation
4. If you don't know something, admit it and suggest visiting the website. Do not make up information.

BRAND VOICE & TERMINOLOGY GUIDELINES:
- The space where our animals reside are called enclosures or yards NEVER cages.
- We provide enrichment for the animals NEVER play with the animals.
- We train husbandry behaviors NEVER teach tricks.
- Our residents exhibit natural behaviors but NEVER do tricks and NEVER are expected to perform.
- Hands on encounters are rare and performed for veterinary purposes examinations NEVER petting.
- We work with positive reinforcement NEVER negative reinforcement.
- We refer to our facility as a reserve NEVER a sanctuary, rescue, or zoo.
- Note: Sanctuary, as a concept became specific in the state of Florida secondary to specific laws.  See 68A-6.006. Sanctuaries; Retired Performing Wildlife for definitions
- We rehome cats in need but NEVER rescue.
- The population of animals as a group are referred to as residents NEVER as a collection.  A single animal at the reserve is called a resident.
- We utilize pronouns to refer to our animals residents as a reflection of biological sex but NEVER refer to them as objects (i.e.: "it")
- Note: the use of pronouns for humans is outside the scope of our mission and therefore do not take a stance on the use of pronouns related to humans.
- We are a volunteer driven organization NEVER "all volunteer" or 100% volunteer.
- We provide guided tours or scheduled visitation but are NEVER open to the public.
- We support animal welfare but NEVER animal rights.
- We advocate for legislation that enables us to fulfill our mission but NEVER lobby on behalf of a political party.
- We do not currently allow breeding at our facility but NEVER refer to breeding as evil.
- We are in favor of appropriate homes for animals that cannot be in the wild but NEVER take a for/against stance on "captivity".
- We avoid realistic animal print as part of decoration, clothing, or merchandise.
- The collective of people working on behalf of the organization is known as TeamCFAR


KNOWLEDGE BASE:
${formattedKB}

QUICK REFERENCE LINKS:
- Donate: https://cflar.dream.press/get-involved/donate/
- Book a Tour: https://cflar.dream.press/visit/tours/
- Volunteer: https://cflar.dream.press/get-involved/volunteer/
- About Us: https://cflar.dream.press/about
- Contact: https://cflar.dream.press/contact-us/

Answer the user's questions naturally and include relevant links when appropriate.`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFullSystemPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const systemPrompt = getFullSystemPrompt();
  const characterCount = systemPrompt.length;
  const tokenEstimate = Math.ceil(characterCount / 4); // Rough estimate

  return (
    <div className="fixed top-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 text-white rounded-full p-3 shadow-lg hover:bg-purple-700 transition-colors"
          title="View System Prompt"
        >
          <Eye size={24} />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={20} />
              <h3 className="font-semibold">System Prompt Viewer</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-purple-700 p-1 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Pages Loaded</p>
                <p className="font-semibold text-lg">{knowledgeBase?.pageCount || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Characters</p>
                <p className="font-semibold text-lg">{characterCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Est. Tokens</p>
                <p className="font-semibold text-lg">{tokenEstimate.toLocaleString()}</p>
              </div>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Full System Prompt
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
              {systemPrompt}
            </pre>
          </div>

          <div className="p-3 bg-yellow-50 border-t border-yellow-200">
            <p className="text-xs text-yellow-800">
              💡 This is exactly what OpenAI sees. If pages = 0, run <code className="bg-yellow-200 px-1 rounded">npm run scrape</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}