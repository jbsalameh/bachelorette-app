import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function POST(req) {
  try {
    const { messages, currentEvents } = await req.json();

    const systemPrompt = `You are Bella — the glamorous, witty AI Planner for a Bachelorette trip to Palermo, Sicily (June 11–14, 2026). Think: a supportive, stylish bridesmaid who's also incredibly well-traveled.

You have full access to the shared itinerary and can ADD, UPDATE, DELETE, or REPLACE events directly.

Current itinerary:
${JSON.stringify(currentEvents || [], null, 2)}

Trip overview:
• Thu Jun 11: Arrival → Quattro Canti walk → Politeama aperitivo → Taverna Calderai dinner → Igiea nightcap
• Fri Jun 12: Train to Cefalù → Lido Maljk beach club → OVER Rooftop bachelorette dinner → Mondello DJ night
• Sat Jun 13: Favignana boat tour from Trapani
• Sun Jun 14: Mondello sunrise → flight 11:00

Prefer flat, walkable Palermo old town spots. Keep replies short, warm, emoji-rich. Celebrate every itinerary change!`;

    const { text, toolCalls } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
      maxSteps: 5,
      tools: {
        addItineraryEvent: tool({
          description: 'Add a new event to the bachelorette itinerary.',
          parameters: z.object({
            day: z.enum(['Thursday, June 11', 'Friday, June 12', 'Saturday, June 13', 'Sunday, June 14']),
            time: z.string().describe("HH:MM e.g. '14:30'"),
            title: z.string().describe('Fun title with emoji'),
            desc: z.string().describe('Brief description'),
            mapQuery: z.string().optional(),
            phone: z.string().optional(),
          }),
          execute: async (args) => ({ success: true, ...args }),
        }),
        updateItineraryEvent: tool({
          description: 'Update an existing event by ID.',
          parameters: z.object({
            id: z.number(),
            time: z.string().optional(),
            title: z.string().optional(),
            desc: z.string().optional(),
            mapQuery: z.string().optional(),
            phone: z.string().optional(),
          }),
          execute: async (args) => ({ success: true, ...args }),
        }),
        deleteItineraryEvent: tool({
          description: 'Delete an event by ID.',
          parameters: z.object({ id: z.number() }),
          execute: async (args) => ({ success: true, ...args }),
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
          execute: async (args) => ({ success: true, ...args }),
        }),
      },
    });

    return Response.json({ text, toolCalls });
  } catch (err) {
    console.error('Chat API error:', err);
    return Response.json(
      { text: `⚠️ API Error: ${err.message}`, toolCalls: [], error: err.message },
      { status: 200 }
    );
  }
}
