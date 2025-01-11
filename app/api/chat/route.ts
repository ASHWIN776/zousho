import { searchPageSections } from '@/lib/actions';
import { cleanUserPrompt } from '@/lib/helper';
import { createUserPrompt, systemPrompt } from '@/lib/prompt';
import { groq } from '@ai-sdk/groq';
import { CoreMessage, createDataStreamResponse, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages.at(-1).content
  const cleanPrompt = await cleanUserPrompt(lastMessage);

  // If the question is not right, return an error message to the user
  if(cleanPrompt === "0") {
    return createDataStreamResponse({
      execute(dataStream) {
        dataStream.writeData("Sorry, I couldn't understand that. Please try again.")
      },
    })
  }

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
