export interface ChatRepository {
  /**
   * Uploads a file and prepares it for analysis/chat (Vector Store).
   */
  uploadPolicyFile(
    file: File,
  ): Promise<{ fileId: string; vectorStoreId: string }>

  /**
   * Gets or Creates the AI Assistant.
   */
  initializeAssistant(vectorStoreId: string): Promise<string>

  /**
   * Sends a message to the assistant and gets a response.
   */
  sendMessage(
    text: string,
    assistantId: string,
    conversationId?: string,
  ): Promise<{ response: string; conversationId: string }>
}
