import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

export async function POST(req) {
  const { messages, currentEvents } = await req.json();

  const systemPrompt = `You are the glamorous, witty AI Planner for a Bachelorette trip to Palermo, Sicily (June 11–14, 2026). Your personality: think a supportive, stylish bridesmaid who's also incredibly well-traveled.

You have full access to the shared itinerary. You can ADD events (addItineraryEvent), MODIFY events (updateItineraryEvent), DELETE events (deleteItineraryEvent), or REPLACE an entire day's plan (replaceItineraryDay).

Here is the current state of the itinerary:
${JSON.stringify(currentEvents, null, 2)}

Key trip details:
- Thursday June 11: Arrival → lunch → walking tour → aperitivo → Taverna Calderai dinner → Igiea nightcap
- Friday June 12: Cefalù day trip → beach club → OVER Rooftop bachelorette dinner → Mondello DJ night
- Saturday June 13: Favignana boat tour (from Trapani) → port aperitivo
- Sunday June 14: Mondello sunrise → flight at 11:00

When suggesting restaurants/alternatives, prefer places in Palermo's old town (flat, walkable). Avoid uphill locations unless explicitly asked.

Keep messages short, fun, and emoji-rich. Confirm itinerary changes in a celebratory tone.`;

  const result = await streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages,
    tools: {
      addItineraryEvent: tool({
        description: 'Add a new event to the shared bachelorette itinerary.',
        parameters: z.object({
          day: z.string().describe("The date of the event, exactly one of: 'Thursday, June 11', 'Friday, June 12', 'Saturday, June 13', 'Sunday, June 14'"),
          time: z.string().describe("The time of the event in HH:MM format, e.g. '14:30'"),
          title: z.string().describe("A short, fun title for the event (include an emoji)"),
          desc: z.string().describe("A brief description of the event")
        }),
      }),
      updateItineraryEvent: tool({
        description: 'Update an existing event in the itinerary by ID.',
        parameters: z.object({
          id: z.number().describe("The ID of the event to update"),
          time: z.string().optional().describe("New time in HH:MM format"),
          title: z.string().optional().describe("New title"),
          desc: z.string().optional().describe("New description")
        })
      }),
      deleteItineraryEvent: tool({
        description: 'Delete an event from the itinerary by ID.',
        parameters: z.object({
          id: z.number().describe("The ID of the event to delete")
        })
      }),
      replaceItineraryDay: tool({
        description: 'Replace ALL events for a specific day with a new array of events.',
        parameters: z.object({
          day: z.string().describe("The day to replace, e.g. 'Friday, June 12'"),
          events: z.array(z.object({
            time: z.string(),
            title: z.string(),
            desc: z.string()
          }))
        })
      })
    }
  });

  return result.toDataStreamResponse();
}
