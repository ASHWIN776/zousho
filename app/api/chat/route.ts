import { searchPageSections } from '@/lib/actions';
import { createUserPrompt, systemPrompt } from '@/lib/prompt';
import { groq } from '@ai-sdk/groq';
import { CoreMessage, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[0].content

  console.log("Prompt of the user: ", lastMessage)
  const contextList = await searchPageSections(lastMessage, "all");
  const systemMessage: CoreMessage = {
    role: "system",
    content: systemPrompt
  }
  
  const userMessage: CoreMessage = {
    role: "user",
    content: createUserPrompt(contextList, lastMessage)
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      systemMessage,
      userMessage
    ]
  });

  return result.toDataStreamResponse();
}
