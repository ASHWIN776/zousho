import { CoreMessage, generateText, streamText } from "ai";
import { groq } from '@ai-sdk/groq';
import { cleanQuestionPrompt, createToCleanQuestionPrompt } from "./prompt";

export const formatTitle = (title: string) => {
  return title.length > 40 ? title.substring(0, 40) + "..." : title;
}

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