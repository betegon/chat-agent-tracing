import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

function getLocation() {
  return { lat: 37.7749, lon: -122.4194 };
}

function getWeather({ lat, lon, unit }) {
  return { value: 25, description: 'Sunny' };
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
    tools: {
      getLocation: {
        description: 'Get the location of the user',
        parameters: z.object({}),
        execute: async (args, { toolCallId }) => {
          const { lat, lon } = getLocation();
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
          const { lat, lon, unit } = args;
          const { value, description } = getWeather({ lat, lon, unit });
          return {
            toolCallId,
            result: `It is currently ${value}°${unit} and ${description}!`
          };
        },
      },
    },
  });

  return result.toDataStreamResponse();
}