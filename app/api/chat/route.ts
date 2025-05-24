import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

function getLocation({ city = 'San Francisco' }: { city: string }) {
  // Pretend we're looking up coordinates for the city
  return { lat: 37.7749, lon: -122.4194 };
}

function getWeather({ lat, lon, unit = 'C' }: { lat: number; lon: number; unit: 'C' | 'F' }) {
  // Pretend we're fetching real weather data
  return { value: 25, description: 'Sunny' };
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4.1-nano-2025-04-14'),
    system: 'You are a helpful assistant.',
    messages,
    experimental_telemetry: { isEnabled: true,
      functionId: 'Weather-Function',
      metadata: {
        weatherCustomKey: 'custom value',
        weatherOtherKey: 'other value',
      },
     },
    tools: {
      getLocation: {
        description: 'Get the location of the user',
        parameters: z.object({
          city: z.string().describe('The city to get coordinates for'),
        }),
        execute: async (args, { toolCallId }) => {
          const { lat, lon } = getLocation(args);
          return {
            toolCallId,
            result: `Your location is at latitude ${lat} and longitude ${lon}`
          };
        },
      },
      getWeather: {
        description: 'Get the weather for a location',
        parameters: z.object({
          lat: z.number().describe('The latitude of the location'),
          lon: z.number().describe('The longitude of the location'),
          unit: z
            .enum(['C', 'F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async (args, { toolCallId }) => {
          const { value, description } = getWeather(args);
          return {
            toolCallId,
            result: `It is currently ${value}°${args.unit} and ${description}!`
          };
        },
      },
    },
  });

  return result.toDataStreamResponse();
}