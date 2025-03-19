'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContentType, Page } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useChat } from 'ai/react';
import { Loader2, MessageCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { fetchPages } from '@/lib/actions';
import { CodeBlock } from '@/components/code-block';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, data, setData, setMessages } = useChat();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const pages = await fetchPages("all");
      setPages(pages);
      setLoading(false);
    })()
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <span className="text-3xl font-semibold mb-2">Your Library is Empty</span>
        <p className="text-gray-400 text-md max-w-md mb-4">
          Add some websites or notes to your library first. Once you have content, you can start chatting with your memory!
        </p>
        <Button asChild>
          <a href="/dashboard/library">Go to Library</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full max-h-[calc(100vh_-_28px)]  gap-y-6 px-4 lg:px-0">
      <div className="grow overflow-y-auto pr-3">
        {
          messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full">

              <span className="text-3xl font-semibold mb-2">Talk to your Memory!</span>
              <p className="text-gray-400 text-md max-w-md">
              Recall anything you want, effortlessly. Type your message in the box below to dive in.
              </p>
            </div>
          )
          :
            <div className="flex flex-col gap-y-4">
              {messages.map(message => (
                <div key={message.id} className="whitespace-pre-wrap">
                  <div className={`${message.role !== "user" ? "border rounded-md p-4 bg-sidebar" : ""}`}>
                    <div className="font-bold text-secondary-foreground">{message.role === "user" ? "User: " : "AI: "}</div>
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
                        }
                      }}
                    >
                      {message.content.length > 0 ? (
                        message.content
                      ) : undefined}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {
                data && data.length > 0 ?
                (
                  <div className="border rounded-md p-4 bg-sidebar">
                    <div className="font-bold text-secondary-foreground">AI:</div>
                    <span>{data[0] as string}</span>
                  </div>
                )
                : undefined
              }
            </div>
        }
      </div>

      <form
        className='py-4 flex gap-x-4'
        onSubmit={event => {
          const formData = new FormData(event.currentTarget);
          const type = formData.get("type") as ContentType;

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
        }}>
        <Input
          className=""
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <Select 
          name="type"
          defaultValue="all"
        >
          <SelectTrigger className="mr-4 lg:mr-0 w-[calc(100%_-120px)] lg:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="note">Note</SelectItem>
          </SelectContent>
        </Select>
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