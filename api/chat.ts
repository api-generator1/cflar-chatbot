// SECURE SERVER-SIDE API ENDPOINT
// This runs on the server, so the API key is NEVER exposed to browsers

import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// This comes from Vercel environment variables (secure!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS for your WordPress site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, knowledgeBase } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages required' });
    }

    // Debug logging
    console.log('=== CHAT API DEBUG ===');
    console.log('Knowledge Base received:', knowledgeBase ? 'YES' : 'NO');
    if (knowledgeBase) {
      try {
        const kb = JSON.parse(knowledgeBase);
        console.log('KB Pages:', kb.pageCount || 0);
        console.log('KB Last Updated:', kb.lastUpdated);
      } catch (e) {
        console.log('KB Parse Error:', e);
      }
    }
    console.log('===================');

    // Build the system prompt with knowledge base context
    
    // Parse and format the knowledge base for the AI
    let formattedKnowledgeBase = 'No knowledge base provided. Please direct users to visit https://cflar.dream.press for information.';
    
    if (knowledgeBase) {
      try {
        const kb = JSON.parse(knowledgeBase);
        if (kb.pages && kb.pages.length > 0) {
          formattedKnowledgeBase = kb.pages.map((page: any) => {
            return `
PAGE: ${page.title}
URL: ${page.url}
CONTENT: ${page.content}
HEADINGS: ${page.headings.join(', ')}
---`;
          }).join('\n\n');
          
          console.log('✅ Formatted KB - Total pages:', kb.pages.length);
          console.log('📄 Sample page:', kb.pages[0]?.title);
        }
      } catch (e) {
        console.error('Failed to parse knowledge base:', e);
      }
    }
    
    const systemPrompt = `You are a helpful AI website assistant for the Central Florida Animal Reserve (CFLAR), a non-profit big cat reserve in St. Cloud, FL.

IMPORTANT INSTRUCTIONS:
1. Provide detailed, helpful answers based on the knowledge base below
2. When including URLs in your responses, ALWAYS use markdown link format: [Page Name](URL)
   - CORRECT: "Learn more on the [Group Volunteers page](https://cflar.dream.press/get-involved/volunteer/group-volunteers)"
   - CORRECT: "Visit the [Tours page](https://cflar.dream.press/visit/tours) to book your experience"
   - INCORRECT: "Learn more here: https://cflar.dream.press/..."
   - INCORRECT: "Learn more on the Group Volunteers page: https://cflar.dream.press/..."
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

GENERAL INFORMATION
Central Florida Animal Reserve is located at 500 Broussard Rd, St. Cloud, FL 34773.

KNOWLEDGE BASE:
${formattedKnowledgeBase}

QUICK REFERENCE LINKS:
- Donate: https://cflar.dream.press/get-involved/donate/
- Book a Tour: https://cflar.dream.press/visit/tours/
- Volunteer: https://cflar.dream.press/get-involved/volunteer/
- About Us: https://cflar.dream.press/about
- Contact: https://cflar.dream.press/contact-us/

Answer the user's questions naturally and include relevant links when appropriate.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini', // Using gpt-5-mini with automatic prompt caching support
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      // GPT-5 mini only supports temperature: 1 (default), so we omit it
      max_completion_tokens: 1000, // GPT-5 mini uses max_completion_tokens instead of max_tokens
    });

    const responseMessage = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

    // Log cache usage for monitoring cost savings
    const usage = completion.usage;
    if (usage) {
      console.log('=== TOKEN USAGE ===');
      console.log('Prompt tokens:', usage.prompt_tokens);
      console.log('Completion tokens:', usage.completion_tokens);
      console.log('Total tokens:', usage.total_tokens);
      // Cache stats (if available in usage object)
      if ('prompt_tokens_details' in usage) {
        const details = (usage as any).prompt_tokens_details;
        if (details?.cached_tokens) {
          console.log('🎯 CACHED tokens:', details.cached_tokens);
          console.log('💰 Cache savings: ~', Math.round((details.cached_tokens / usage.prompt_tokens) * 100), '%');
        }
      }
      console.log('==================');
    }

    return res.status(200).json({
      message: responseMessage,
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Don't expose internal errors to users
    return res.status(500).json({
      error: 'Sorry, I encountered an error. Please try again or visit https://cflar.dream.press for assistance.',
    });
  }
}