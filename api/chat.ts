// SECURE SERVER-SIDE API ENDPOINT WITH STREAMING & CACHING
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
  // ⏱️ Start total request timer
  const startTime = Date.now();
  
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

    // ⏱️ KB parsing start
    const kbParseStart = Date.now();
    
    // Debug logging
    console.log('=== CHAT API DEBUG ===');
    console.log('🤖 Model: gpt-4o-mini (with streaming + caching)');
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
    
    // ⏱️ KB parsing complete
    const kbParseEnd = Date.now();
    console.log(`⏱️ KB Parsing Time: ${kbParseEnd - kbParseStart}ms`);
    
    const systemPrompt = `You are a helpful AI website assistant for the Central Florida Animal Reserve (CFLAR), a non-profit big cat reserve in St. Cloud, FL.

STRICT FORMATTING RULE:
Never use asterisks (*) for bold text or lists. Do not use *, **, or *** anywhere in the response.

Use numbered lists (1. 2. 3.) or plain paragraph formatting instead.

TODAY'S DATE: ${todayFormatted}

IMPORTANT: When users ask about "upcoming events" or "future events", ONLY mention events that occur AFTER today's date. Do NOT mention past events. If the knowledge base contains event dates, check them against today's date and filter out any that have already passed.

🚨🚨🚨 CRITICAL FORMATTING RULE #2 🚨🚨🚨
ALWAYS USE MARKDOWN LINKS for any URL mention: [Page Name](URL)

✅ CORRECT: "Visit the [Tours page](https://cflar.dream.press/visit/tours) to book"
❌ WRONG: "Tours page: https://cflar.dream.press/visit/tours"

WRITE IN A NATURAL, CONVERSATIONAL TONE - Use complete sentences and paragraphs. Weave information together naturally.

IMPORTANT INSTRUCTIONS:
1. Provide detailed, helpful answers based on the knowledge base below
2. Be warm, educational, and enthusiastic about big cat conservation
3. If you don't know something, admit it and suggest visiting the website. Do not make up information.

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

FINAL REMINDER: DO NOT USE ASTERISKS (*) - Use numbered lists or natural paragraph form instead!`;

    // ⏱️ OpenAI API call start
    const apiCallStart = Date.now();
    console.log('⏱️ Starting OpenAI API call with streaming...');
    
    // Set headers for Server-Sent Events (SSE) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: [
            {
              type: 'text',
              text: systemPrompt,
              // Enable prompt caching for the knowledge base (saves 50% on input tokens)
              cache_control: { type: 'ephemeral' }
            }
          ] as any
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 350, // Reduced from 1000 to 350 for faster responses (~260 words)
      stream: true, // Enable streaming for instant user feedback
      stream_options: {
        include_usage: true, // Get token usage stats including cache info
      }
    });

    let fullResponse = '';
    let firstChunkTime = 0;
    let chunkCount = 0;

    // Stream the response chunks to the client
    for await (const chunk of stream) {
      chunkCount++;
      
      // Track time to first chunk (TTFB - Time To First Byte)
      if (chunkCount === 1) {
        firstChunkTime = Date.now() - apiCallStart;
        console.log(`⏱️ Time to First Chunk: ${firstChunkTime}ms`);
      }

      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        // Send chunk to client as SSE
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }

      // Check for usage stats in the final chunk
      if (chunk.usage) {
        const usage = chunk.usage;
        console.log('');
        console.log('=== TOKEN USAGE ===');
        console.log('Prompt tokens:', usage.prompt_tokens);
        console.log('Completion tokens:', usage.completion_tokens);
        console.log('Total tokens:', usage.total_tokens);
        
        // Log cache performance
        if ('prompt_tokens_details' in usage) {
          const details = (usage as any).prompt_tokens_details;
          if (details?.cached_tokens) {
            console.log('🎯 CACHED tokens:', details.cached_tokens);
            console.log('💰 Cache savings:', Math.round((details.cached_tokens / usage.prompt_tokens) * 100), '%');
          }
        }
        console.log('==================');
      }
    }

    // ⏱️ Streaming complete
    const apiCallEnd = Date.now();
    const totalTime = Date.now() - startTime;
    
    console.log('');
    console.log('=== PERFORMANCE SUMMARY ===');
    console.log(`🤖 Model: gpt-4o-mini (streaming + caching)`);
    console.log(`⏱️ KB Parsing: ${kbParseEnd - kbParseStart}ms`);
    console.log(`⏱️ Time to First Chunk: ${firstChunkTime}ms`);
    console.log(`⏱️ Total Streaming Time: ${apiCallEnd - apiCallStart}ms`);
    console.log(`⏱️ Total Chunks: ${chunkCount}`);
    console.log(`⏱️ TOTAL TIME: ${totalTime}ms`);
    console.log('==========================');
    console.log('');

    // Send done signal
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Send error as SSE
    res.write(`data: ${JSON.stringify({ 
      error: 'Sorry, I encountered an error. Please try again or visit https://cflar.dream.press for assistance.' 
    })}\n\n`);
    res.end();
  }
}