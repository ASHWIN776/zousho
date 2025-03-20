'use client';

import { Button } from '@/components/ui/button';
import { ContentType, Page } from '@/lib/types';
import { useChat } from 'ai/react';
import { Loader2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchPages } from '@/lib/actions';
import { CodeBlock } from '@/components/code-block';
import { ChatForm } from '@/components/chat-form';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, data, setData, setMessages } = useChat();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, data]);

  useEffect(() => {
    // Use the supabase client to fetch pages, and fetch only the count
    (async () => {
      const pages = await fetchPages("all");
      setPages(pages);
      setLoading(false);
    })();
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const type = formData.get("type") as ContentType;

    // If this is the first message, trigger the transition and wait for it to complete
    if (!messages.length) {
      setIsTransitioning(true);
      // Wait for the transition animation to complete
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if(data && data.length > 0) {
      setMessages([...messages, {
        id: `${data[0] as string}-${messages.length}`,
        role: "assistant",
        content: data[0] as string
      }])
    }
    setData(undefined)
    handleSubmit(event, {
      data: {
        type
      }
    })
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <span className="text-3xl font-semibold mb-2">Your Library is Empty</span>
            <p className="text-gray-400 text-md max-w-md mb-4">
              Add some websites or notes to your library first. Once you have content, you can start chatting with your memory!
            </p>
            <Button asChild>
              <a href="/dashboard/library">Go to Library</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className={`flex-1 flex flex-col items-center justify-center px-4 gap-y-2 transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-[-20px]' : 'opacity-100'}`}>
          <span className="text-4xl mb-2 block">Recall from your Memory!</span>
          <div className={`w-full max-w-3xl transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-[40px]' : 'opacity-100'}`}>
            <ChatForm
              input={input}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          <div className="flex flex-col gap-y-4 max-w-3xl mx-auto px-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className="whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-4 ${message.role !== "user" ? "border rounded-md bg-sidebar" : ""}`}>
                  <ReactMarkdown
                    components={{
                      code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return !isInline ? (
                          <CodeBlock
                            language={match[1]}
                            value={String(children).replace(/\n$/, '')}
                          />
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {
              data && data.length > 0 ?
              (
                <div className="border rounded-md p-4 bg-sidebar animate-in fade-in slide-in-from-bottom-2">
                  <span>{data[0] as string}</span>
                </div>
              )
              : undefined
            }
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-2">
        <ChatForm
          input={input}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
}