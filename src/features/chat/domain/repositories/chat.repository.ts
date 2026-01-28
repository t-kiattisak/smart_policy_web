export interface ChatRepository {
  /**
   * Uploads a file and prepares it for analysis/chat (Vector Store).
   */
  uploadPolicyFile(
    file: File,
  ): Promise<{ fileId: string; vectorStoreId: string }>

  /**
   * Gets or Creates the AI Assistant.
   * If vectorStoreId is provided, it will be added to the assistant's vector stores.
   */
  initializeAssistant(vectorStoreId?: string): Promise<string>

  /**
   * Gets the assistant ID by name (without creating or updating).
   * Returns null if assistant doesn't exist.
   */
  getAssistantId(): Promise<string | null>

  /**
   * Sends a message to the assistant and gets a response.
   */
  sendMessage(
    text: string,
    assistantId: string,
    conversationId?: string,
  ): Promise<{ response: string; conversationId: string }>
}
