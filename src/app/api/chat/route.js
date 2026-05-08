import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-2.5-flash'),
    system: "You are the fun, enthusiastic AI Planner for a Bachelorette trip to Palermo, Sicily (June 11-14, 2026). The vibe is 'Summer in Sicily', premium, elegant, and fun. Help the girls with packing tips, local recommendations, etiquette, or anything else they need. You also have the power to ADD events to the shared itinerary! If the user asks you to schedule something or add an event, use the addItineraryEvent tool. Keep responses concise, playful, and use emojis. Speak as if you are a supportive bridesmaid.",
    messages,
    tools: {
      addItineraryEvent: tool({
        description: 'Add a new event to the shared bachelorette itinerary.',
        parameters: z.object({
          day: z.string().describe("The date of the event, must be exactly one of: 'Thursday, June 11', 'Friday, June 12', 'Saturday, June 13', 'Sunday, June 14'"),
          time: z.string().describe("The time of the event in HH:MM format, e.g. '14:30'"),
          title: z.string().describe("A short, fun title for the event (include an emoji)"),
          desc: z.string().describe("A brief description of the event")
        }),
      })
    }
  });

  return result.toDataStreamResponse();
}
