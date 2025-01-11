'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from 'ai/react';
import { Loader2, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, data, setData, setMessages } = useChat();

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
                    <ReactMarkdown>
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
          if(data && data.length > 0) {
            setMessages([...messages, {
              id: `${data[0] as string}-${messages.length}`,
              role: "assistant",
              content: data[0] as string
            }])
          }
          setData(undefined)
          handleSubmit(event)
        }}>
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