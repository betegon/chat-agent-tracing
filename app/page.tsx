'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
    maxSteps: 5,
  });

  return (
    <div className="p-4">
      <div className="space-y-4 mb-4">
        {messages.map((message, index) => (
          <div key={index} className="border rounded p-3">
            <div className="font-bold">{message.role === 'user' ? 'You' : 'Assistant'}</div>
            {message.toolInvocations?.map((tool, toolIndex) => (
              <div key={toolIndex} className="mt-2 bg-gray-100 p-2 rounded">
                <div className="text-sm text-gray-600">Tool: {tool.toolName}</div>
                <div>{tool.response}</div>
              </div>
            ))}
            <div className="mt-2">{message.content}</div>
          </div>
        ))}
      </div>

      <input
        className="w-full border rounded p-2"
        value={input}
        placeholder="Type a message..."
        onChange={event => setInput(event.target.value)}
        onKeyDown={async event => {
          if (event.key === 'Enter') {
            append({ content: input, role: 'user' });
            setInput('');
          }
        }}
      />
    </div>
  );
}