import { client } from "@/shared/lib/openai"
import type { Tool } from "openai/resources/responses/responses.mjs"
import { CHAT_INSTRUCTIONS } from "@/features/chat/domain/prompts"

const pollResponse = async (responseId: string) => {
  let response = await client.responses.retrieve(responseId)
  while (response.status === "queued" || response.status === "in_progress") {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    response = await client.responses.retrieve(responseId)
  }
  return response
}

export const generateAssistantResponse = async (
  input: string,
  assistantId: string,
  conversationId?: string,
) => {
  const assistant = await client.beta.assistants.retrieve(assistantId)

  const tools = assistant.tools.map((t) => {
    if (t.type === "file_search") {
      return {
        type: "file_search",
        vector_store_ids:
          assistant.tool_resources?.file_search?.vector_store_ids || [],
      }
    }
    return t
  }) as Tool[]

  const response = await client.responses.create({
    model: assistant.model,
    input: input,
    instructions: CHAT_INSTRUCTIONS,
    tools: tools,
    conversation: conversationId,
  })

  return await pollResponse(response.id)
}
