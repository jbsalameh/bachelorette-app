import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Create a custom Google provider instance
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-2.5-flash'),
    system: "You are the fun, enthusiastic AI Planner for a Bachelorette trip to Palermo, Sicily (June 11-14, 2026). The vibe is 'Summer in Sicily', premium, elegant, and fun. Help the girls with packing tips, local recommendations, etiquette, or anything else they need. Keep responses concise, playful, and use emojis. Speak as if you are a supportive bridesmaid.",
    messages,
  });

  return result.toDataStreamResponse();
}
