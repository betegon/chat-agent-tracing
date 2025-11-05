'use client';

import { useChat } from '@ai-sdk/react';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Page() {
  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
    maxSteps: 5,
  });

  useEffect(() => {
    Sentry.logger.info('Chat page loaded', { 
      timestamp: new Date().toISOString(),
      maxSteps: 5 
    });
  }, []);

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-6">
        <img 
          src="/Screenshot 2025-09-30 at 17.01.03.png" 
          alt="Screenshot 1" 
          className="w-1/2 h-auto rounded-lg shadow-lg"
        />
        <img 
          src="/Screenshot 2025-10-01 at 14.22.38.png" 
          alt="Screenshot 2" 
          className="w-1/2 h-auto rounded-lg shadow-lg"
        />
      </div>
      <div className="space-y-4 mb-4">
        {messages.map((message, index) => {          
          return (
            <div key={index} className="border rounded p-3">
              <div className="font-bold">{message.role === 'user' ? 'You' : 'Assistant'}</div>
              {message.toolInvocations?.map((tool, toolIndex) => (
                <div key={toolIndex} className="mt-2 bg-gray-100 p-2 rounded">
                  <div className="text-sm text-gray-600">Tool: {tool.toolName}</div>
                </div>
              ))}
              <div className="mt-2">{message.content}</div>
            </div>
          );
        })}
      </div>

      <input
        className="w-full border rounded p-2"
        value={input}
        placeholder="Type a message..."
        onChange={event => setInput(event.target.value)}
        onKeyDown={async event => {
          if (event.key === 'Enter') {
            Sentry.logger.info('User sent message', {
              messageLength: input.length,
              timestamp: new Date().toISOString(),
              messageCount: messages.length + 1
            });
            append({ content: input, role: 'user' });
            setInput('');
          }
        }}
      />
    </div>
  );
}
