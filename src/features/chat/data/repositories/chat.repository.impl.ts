import type { ChatRepository } from "@/features/chat/domain/repositories/chat.repository"
import { CHAT_INSTRUCTIONS } from "@/features/chat/domain/prompts"
import { generateAssistantResponse } from "@/features/chat/data/sources/responses.api"
import {
  uploadFile,
  createVectorStore,
  addFileToVectorStore,
  client,
} from "@/shared/lib/openai"

const ASSISTANT_NAME = "Smart Policy Assistant"
const DEPLOYMENT = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT

export class ChatRepositoryImpl implements ChatRepository {
  async uploadPolicyFile(
    file: File,
  ): Promise<{ fileId: string; vectorStoreId: string }> {
    const uploaded = await uploadFile(file)
    const vsName = `VS_${Date.now()}`
    const vs = await createVectorStore(vsName)
    await addFileToVectorStore(vs.id, uploaded.id)
    return { fileId: uploaded.id, vectorStoreId: vs.id }
  }

  async initializeAssistant(vectorStoreId: string): Promise<string> {
    const myAssistants = await client.beta.assistants.list({
      order: "desc",
      limit: 20,
    })
    const existing = myAssistants.data.find((a) => a.name === ASSISTANT_NAME)

    if (existing) {
      await client.beta.assistants.update(existing.id, {
        instructions: CHAT_INSTRUCTIONS,
        tool_resources: vectorStoreId
          ? { file_search: { vector_store_ids: [vectorStoreId] } }
          : undefined,
      })
      return existing.id
    }

    const assistant = await client.beta.assistants.create({
      name: ASSISTANT_NAME,
      instructions: CHAT_INSTRUCTIONS,
      model: DEPLOYMENT,
      tools: [{ type: "file_search" }],
      tool_resources: vectorStoreId
        ? { file_search: { vector_store_ids: [vectorStoreId] } }
        : undefined,
    })
    return assistant.id
  }

  async sendMessage(
    text: string,
    assistantId: string,
    conversationId?: string,
  ): Promise<{ response: string; conversationId: string }> {
    const completed = await generateAssistantResponse(
      text,
      assistantId,
      conversationId,
    )

    let outputText = "No response generated."
    const messageItem = completed.output.find((i) => i.type === "message")
    if (messageItem?.content) {
      const textItem = messageItem.content.find((c) => c.type === "output_text")
      if (textItem) outputText = textItem.text
    }

    return {
      response: outputText,
      conversationId: completed.conversation?.id || "",
    }
  }
}
