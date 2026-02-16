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

    // Build the system prompt with knowledge base context
    const systemPrompt = `You are a helpful AI assistant for the Central Florida Animal Reserve (CFLAR), a non-profit big cat sanctuary.

IMPORTANT INSTRUCTIONS:
1. Provide detailed, helpful answers based on the knowledge base below
2. When relevant, include specific URLs for actions users might want to take
3. Be warm, educational, and enthusiastic about big cat conservation
4. If you don't know something, admit it and suggest visiting the website

KNOWLEDGE BASE:
${knowledgeBase || 'No knowledge base provided. Please direct users to visit https://cflar.dream.press for information.'}

QUICK REFERENCE LINKS:
- Donate: https://cflar.dream.press/donate
- Book a Tour: https://cflar.dream.press/tours
- Volunteer: https://cflar.dream.press/volunteer
- About Us: https://cflar.dream.press/about
- Contact: https://cflar.dream.press/contact

Answer the user's questions naturally and include relevant links when appropriate.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseMessage = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

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