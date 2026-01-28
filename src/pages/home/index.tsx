import { ChatInput } from "@/features/chat/presentation/components/chat-input"
import { ChatMessage } from "@/features/chat/presentation/components/chat-message"
import { ChatHeader } from "@/features/chat/presentation/components/chat-header"
import { ChatBackground } from "@/features/chat/presentation/components/chat-background"
import { MarkdownRenderer } from "@/features/chat/presentation/components/markdown-renderer"
import { useChatController } from "@/features/chat/presentation/hooks/use-chat-controller"

export default function HomePage() {
  const {
    messages,
    policies,
    isAnalyzing,
    handleFileUpload,
    handleSendMessage,
  } = useChatController()

  return (
    <div className='flex h-screen flex-col bg-background text-foreground relative overflow-auto'>
      <ChatBackground />

      <ChatHeader policies={policies} />

      <main className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 z-10'>
        <div className='flex flex-1 flex-col gap-4 rounded-lg p-4 h-full'>
          <div className='flex-1 overflow-y-auto space-y-4 px-2'>
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role === "user" ? "user" : "agent"}
                content={m.content}
              >
                <div className='markdown-prose'>
                  <MarkdownRenderer content={m.content} />
                </div>
              </ChatMessage>
            ))}
            {isAnalyzing && (
              <div className='text-sm text-muted-foreground animate-pulse px-4'>
                Analyzing...
              </div>
            )}
          </div>
        </div>
      </main>
      <div className='mt-4'>
        <ChatInput
          disabled={isAnalyzing}
          onFileUpload={handleFileUpload}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}
