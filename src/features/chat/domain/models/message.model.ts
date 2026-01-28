export interface MessageModel {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: number
}

export interface ChatState {
  messages: MessageModel[]
  isAnalyzing: boolean
  assistantId: string | null
  conversationId: string | null
}
