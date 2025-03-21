'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from 'lucide-react';
import React from 'react';

interface ChatFormProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export function ChatForm({ input, isLoading, onInputChange, onSubmit, className = '' }: ChatFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(200, e.target.scrollHeight) + 'px';
  };

  return (
    <form
      className={`bg-background ${className}`}
      onSubmit={onSubmit}
    >
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex flex-col gap-y-4 rounded-lg border border-gray-600 bg-background p-4">
          <div className="flex items-center">
            <Select name="type" defaultValue="all">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              type="submit" 
              className="ml-auto"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Recalling
                </>
              ) : (
                <>
                  Recall
                </>
              )}
            </Button>
          </div>
          <textarea
            value={input}
            placeholder="Ask a question..."
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  const form = e.currentTarget.form;
                  if (form) form.requestSubmit();
                }
              }
            }}
            rows={1}
            className="w-full resize-none bg-transparent border-0 focus-visible:ring-0 p-0 min-h-[60px] max-h-[200px] overflow-y-auto"
            style={{ outline: 'none' }}
          />
        </div>
      </div>
    </form>
  );
}
