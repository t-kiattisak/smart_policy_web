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
  private async getVectorStoreIdsFromAssistant(
    assistantId: string,
  ): Promise<string[]> {
    try {
      const assistant = await client.beta.assistants.retrieve(assistantId)
      return assistant.tool_resources?.file_search?.vector_store_ids || []
    } catch {
      return []
    }
  }

  async uploadPolicyFile(
    file: File,
  ): Promise<{ fileId: string; vectorStoreId: string }> {
    const uploaded = await uploadFile(file)

    const assistantId = await this.getAssistantId()
    let vectorStoreId: string

    if (assistantId) {
      const existingVectorStoreIds =
        await this.getVectorStoreIdsFromAssistant(assistantId)
      if (existingVectorStoreIds.length > 0) {
        vectorStoreId = existingVectorStoreIds[0]
        await addFileToVectorStore(vectorStoreId, uploaded.id)
      } else {
        const vsName = `VS_${Date.now()}`
        const vs = await createVectorStore(vsName)
        await addFileToVectorStore(vs.id, uploaded.id)
        vectorStoreId = vs.id
      }
    } else {
      const vsName = `VS_${Date.now()}`
      const vs = await createVectorStore(vsName)
      await addFileToVectorStore(vs.id, uploaded.id)
      vectorStoreId = vs.id
    }

    return { fileId: uploaded.id, vectorStoreId }
  }

  async getAssistantId(): Promise<string | null> {
    const myAssistants = await client.beta.assistants.list({
      order: "desc",
      limit: 20,
    })
    const existing = myAssistants.data.find((a) => a.name === ASSISTANT_NAME)
    return existing?.id || null
  }

  async initializeAssistant(vectorStoreId?: string): Promise<string> {
    const myAssistants = await client.beta.assistants.list({
      order: "desc",
      limit: 20,
    })
    const existing = myAssistants.data.find((a) => a.name === ASSISTANT_NAME)

    // Azure OpenAI only supports 1 vector store per assistant
    // Use the provided vectorStoreId or keep existing one
    const targetVectorStoreId =
      vectorStoreId ||
      (existing
        ? (await this.getVectorStoreIdsFromAssistant(existing.id))[0]
        : undefined)

    if (existing) {
      await client.beta.assistants.update(existing.id, {
        instructions: CHAT_INSTRUCTIONS,
        tool_resources: targetVectorStoreId
          ? { file_search: { vector_store_ids: [targetVectorStoreId] } }
          : undefined,
      })
      return existing.id
    }

    const assistant = await client.beta.assistants.create({
      name: ASSISTANT_NAME,
      instructions: CHAT_INSTRUCTIONS,
      model: DEPLOYMENT,
      tools: [{ type: "file_search" }],
      tool_resources: targetVectorStoreId
        ? { file_search: { vector_store_ids: [targetVectorStoreId] } }
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
