import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, currentEvents } = await req.json();

    const systemPrompt = `You are Bella — the glamorous, witty AI Planner for a Bachelorette trip to Palermo, Sicily (June 11–14, 2026). Think: a supportive, stylish bridesmaid who's also incredibly well-traveled.

You have full access to the shared itinerary and can ADD, UPDATE, DELETE, or REPLACE events.

Current itinerary:
${JSON.stringify(currentEvents || [], null, 2)}

Trip at a glance:
• Thu Jun 11: Arrival → Quattro Canti walking tour → Politeama aperitivo → Taverna Calderai dinner → Igiea nightcap
• Fri Jun 12: Train to Cefalù → Lido Maljk beach club → OVER Rooftop bachelorette dinner → Mondello DJ night
• Sat Jun 13: Favignana boat tour from Trapani
• Sun Jun 14: Mondello sunrise → flight 11:00

Prefer flat, walkable Palermo old town spots. Keep replies short, warm, emoji-rich. Celebrate every itinerary change!`;

    const result = await streamText({
      model: google('gemini-2.0-flash-exp'),
      system: systemPrompt,
      messages,
      maxSteps: 3,
      tools: {
        addItineraryEvent: tool({
          description: 'Add a new event to the bachelorette itinerary.',
          parameters: z.object({
            day: z.enum(['Thursday, June 11', 'Friday, June 12', 'Saturday, June 13', 'Sunday, June 14']),
            time: z.string().describe("HH:MM format e.g. '14:30'"),
            title: z.string().describe('Short fun title with emoji'),
            desc: z.string().describe('Brief description'),
            mapQuery: z.string().optional().describe('Google Maps search query for this location'),
            phone: z.string().optional().describe('Phone number to reserve'),
          }),
        }),
        updateItineraryEvent: tool({
          description: 'Update an existing event in the itinerary by ID.',
          parameters: z.object({
            id: z.number(),
            time: z.string().optional(),
            title: z.string().optional(),
            desc: z.string().optional(),
            mapQuery: z.string().optional(),
            phone: z.string().optional(),
          }),
        }),
        deleteItineraryEvent: tool({
          description: 'Delete an event from the itinerary by ID.',
          parameters: z.object({ id: z.number() }),
        }),
        replaceItineraryDay: tool({
          description: 'Replace ALL events for a specific day.',
          parameters: z.object({
            day: z.enum(['Thursday, June 11', 'Friday, June 12', 'Saturday, June 13', 'Sunday, June 14']),
            events: z.array(z.object({
              time: z.string(),
              title: z.string(),
              desc: z.string(),
              mapQuery: z.string().optional(),
              phone: z.string().optional(),
            })),
          }),
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
