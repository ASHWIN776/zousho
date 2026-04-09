import { CoreMessage, generateText, streamText } from "ai";
import { groq } from '@ai-sdk/groq';
import { cleanQuestionPrompt, createToCleanQuestionPrompt } from "./prompt";
import crypto from 'crypto';
import {marked} from 'marked';
import DOMPurify from 'dompurify';

export const cleanUserPrompt = async (prompt: string) => {
  
  const systemMessage: CoreMessage = {
    role: "system",
    content: cleanQuestionPrompt
  }

  const userMessage: CoreMessage = {
    role: "user",
    content: createToCleanQuestionPrompt(prompt)
  }

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      systemMessage,
      userMessage
    ]
  })

  return text;
}

export const normalizeUrl = (url: string): string => {
  return url.replace(/\/+$/, "");
}

export const getChecksum = (str: string) => {
  const hash = crypto.createHash('sha256');
  hash.update(str);
  return hash.digest('hex');
}

export const markdownToHtml = (text: string) => {
  if (!text) return '';
  
  // Replace \n\n with actual newlines for proper paragraph separation
  const processedText = text.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
  
  // Convert markdown to HTML
  const rawHtml = marked.parse(processedText, {
    gfm: true,
    breaks: true,
    async: false
  });

  const cleanHtml = DOMPurify.sanitize(rawHtml);
  
  return cleanHtml;
}