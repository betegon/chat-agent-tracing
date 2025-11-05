import { streamText } from 'ai';
import type { ToolInvocation } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

function getLocation({ city = 'San Francisco' }: { city: string }) {
  Sentry.logger.warn('Getting location coordinates', { city });
  // Pretend we're looking up coordinates for the city
  const result = { lat: 37.7749, lon: -122.4194 };
  Sentry.logger.info('Location retrieved', { city, ...result });
  return result;
}

function getWeather({ lat, lon, unit = 'C' }: { lat: number; lon: number; unit: 'C' | 'F' }) {
  Sentry.logger.warn('Fetching weather data', { lat, lon, unit });
  // Pretend we're fetching real weather data
  const result = { value: 25, description: 'Sunny' };
  Sentry.logger.info('Weather data retrieved', { lat, lon, unit, ...result });
  return result;
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  Sentry.logger.info('Chat API request received', {
    messageCount: messages.length,
    lastMessageRole: messages[messages.length - 1]?.role,
    timestamp: new Date().toISOString()
  });

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
          Sentry.logger.info('Tool invoked: getLocation', { 
            toolCallId, 
            city: args.city 
          });
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
          Sentry.logger.info('Tool invoked: getWeather', { 
            toolCallId, 
            lat: args.lat, 
            lon: args.lon, 
            unit: args.unit 
          });
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
