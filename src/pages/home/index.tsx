import { useEffect, useRef, useState } from "react"
import { ChatInput } from "@/features/chat/presentation/components/chat-input"
import { ChatMessage } from "@/features/chat/presentation/components/chat-message"
import { ChatHeader } from "@/features/chat/presentation/components/chat-header"
import { ChatBackground } from "@/features/chat/presentation/components/chat-background"
import { MarkdownRenderer } from "@/features/chat/presentation/components/markdown-renderer"
import { PolicyCard } from "@/features/chat/presentation/components/policy-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dialog"
import { Button } from "@/shared/components/button"
import { CloudUploadIcon } from "lucide-react"
import { useChatController } from "@/features/chat/presentation/hooks/use-chat-controller"
import type { PolicyModel } from "@/features/chat/domain/models/policy.model"

export default function HomePage() {
  const {
    messages,
    policies,
    isAnalyzing,
    handleFileUpload,
    handleSendMessage,
  } = useChatController()

  const [selectedPolicy, setSelectedPolicy] = useState<PolicyModel | null>(null)
  const triggerUploadRef = useRef<(() => void) | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change or when analyzing
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isAnalyzing])

  return (
    <div className='flex h-screen flex-col bg-background text-foreground relative overflow-auto'>
      <ChatBackground />

      <ChatHeader policies={policies} />

      <main className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 z-10'>
        <div className='flex flex-1 flex-col gap-4 rounded-lg p-4 h-full'>
          <div
            ref={messagesContainerRef}
            className='flex-1 overflow-y-auto space-y-4 px-2'
          >
            {messages.length === 0 && policies.length === 0 && !isAnalyzing && (
              <div className='flex flex-col items-center justify-center min-h-[200px] text-center px-4'>
                <p className='text-muted-foreground text-base mb-2'>
                  ยินดีต้อนรับสู่ Smart Policy
                </p>
                <p className='text-muted-foreground text-sm mb-4 max-w-sm'>
                  อัปโหลดกรมธรรม์ประกันภัย (PDF) ก่อน เพื่อให้ AI
                  ช่วยตรวจสอบความคุ้มครองและตอบคำถามได้
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => triggerUploadRef.current?.()}
                  className='gap-2'
                >
                  <CloudUploadIcon className='w-4 h-4' />
                  อัปโหลดกรมธรรม์ (PDF)
                </Button>
                <p className='text-xs text-muted-foreground mt-3'>
                  หรือกดปุ่มอัปโหลดด้านล่าง
                </p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className='space-y-3'>
                {m.policy && (
                  <div className='max-w-md'>
                    <PolicyCard
                      policy={m.policy}
                      onViewDetails={() => setSelectedPolicy(m.policy || null)}
                    />
                  </div>
                )}
                <ChatMessage
                  role={m.role === "user" ? "user" : "agent"}
                  content={m.content}
                >
                  <div className='markdown-prose'>
                    <MarkdownRenderer content={m.content} />
                  </div>
                </ChatMessage>
              </div>
            ))}
            {isAnalyzing && (
              <div className='text-sm text-muted-foreground animate-pulse px-4'>
                Analyzing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>
      <div className='mt-4'>
        <ChatInput
          disabled={isAnalyzing}
          onFileUpload={handleFileUpload}
          onSendMessage={handleSendMessage}
          uploadTriggerRef={triggerUploadRef}
        />
      </div>

      {/* Policy Details Dialog */}
      <Dialog
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
      >
        <DialogContent className='sm:max-w-3xl'>
          {selectedPolicy && (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <div className={`p-1.5 rounded-md ${selectedPolicy.color}`}>
                    {selectedPolicy.icon && (
                      <selectedPolicy.icon className='w-5 h-5' />
                    )}
                  </div>
                  {selectedPolicy.name}
                </DialogTitle>
                <DialogDescription>รายละเอียดความคุ้มครอง</DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 max-h-[60vh] overflow-y-auto'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>เลขที่กรมธรรม์</span>
                    <span className='font-medium font-mono'>
                      {selectedPolicy.number}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>ผู้เอาประกัน</span>
                    <span className='font-medium'>{selectedPolicy.holder}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>วันหมดอายุ</span>
                    <span className='font-medium'>{selectedPolicy.expiry}</span>
                  </div>

                  <div className='pt-2 border-t border-gray-200'>
                    <div className='markdown-content'>
                      <MarkdownRenderer
                        content={selectedPolicy.content || ""}
                      />
                    </div>
                  </div>

                  <div className='border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm'>
                    <span className='text-gray-500'>สถานะ</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        selectedPolicy.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedPolicy.status === "Active"
                        ? "คุ้มครอง"
                        : "หมดอายุ"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button
                  variant='outline'
                  onClick={() => setSelectedPolicy(null)}
                >
                  ปิด
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
