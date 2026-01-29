import type { PolicyModel } from "./policy.model"

export interface MessageModel {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: number
  policy?: PolicyModel // Optional policy card to display in chat
}

export interface ChatState {
  messages: MessageModel[]
  isAnalyzing: boolean
  assistantId: string | null
  conversationId: string | null
}
