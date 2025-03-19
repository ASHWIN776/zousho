'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { GeistMono } from 'geist/font/mono';

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="rounded-md"
        customStyle={{
          margin: 0,
          padding: '0.75rem 1rem',
          backgroundColor: '#000000',
          borderBottomLeftRadius: '0.375rem',
          borderBottomRightRadius: '0.375rem',
          fontFamily: GeistMono.style.fontFamily,
        }}
        wrapLongLines={false}
        codeTagProps={{
          style: {
            fontFamily: GeistMono.style.fontFamily,
            fontSize: '0.85em',
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            wordBreak: 'keep-all'
          }
        }}
      >
        {value}
      </SyntaxHighlighter>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 hover:bg-muted/30"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
