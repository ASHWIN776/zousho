'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from 'ai/react';
import { Loader2, MessageCircle, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  return (
    <div className="flex flex-col w-[937.438px] mx-auto justify-between h-full max-h-[calc(100vh_-_28px)]  gap-y-6">
      <div className="grow overflow-y-auto pr-3">
        {
          messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full">

              <span className="text-3xl font-semibold mb-2">Talk to your Memory!</span>
              <p className="text-gray-400 text-md max-w-md">
                Start a conversation by typing a message in the box below. 
                Your chat history will appear here.
              </p>
            </div>
          )
          :
            <div className="flex flex-col gap-y-4">
              {messages.map(message => (
                <div key={message.id} className="whitespace-pre-wrap">
                  <div className={`${message.role !== "user" ? "border rounded-md p-4 bg-sidebar" : ""}`}>
                    <div className="font-bold text-secondary-foreground">{message.role === "user" ? "User: " : "AI: "}</div>
                    <ReactMarkdown>
                      {message.content.length > 0 ? (
                        message.content
                      ) : undefined}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      <form
        className='py-4 flex gap-x-4'
        onSubmit={handleSubmit}>
        <Input
          className=""
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        {
          isLoading ? 
            (
              <Button disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Recalling
              </Button>
            )
          : 
          (
            <Button className="bg-foreground">
              <MessageCircle className="w-4 h-4" />
              Recall
            </Button>
          )
        }
      </form>
    </div>
  );
}