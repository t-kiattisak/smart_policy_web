import { useState, useCallback } from "react"
import { ChatRepositoryImpl } from "@/features/chat/data/repositories/chat.repository.impl"
import { PolicyAnalysisServiceImpl } from "@/services/policy-analysis"
import { Car, Shield, Home, FileText } from "lucide-react"
import type { MessageModel } from "@/features/chat/domain/models/message.model"
import type { PolicyModel } from "@/features/chat/domain/models/policy.model"

const repository = new ChatRepositoryImpl()
const policyAnalysisService = new PolicyAnalysisServiceImpl()

export function useChatController() {
  const [messages, setMessages] = useState<MessageModel[]>([])
  const [policies, setPolicies] = useState<PolicyModel[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  // Get assistant ID on mount (persisted across refreshes)
  const getAssistantId = useCallback(async () => {
    try {
      return await repository.getAssistantId()
    } catch (error) {
      console.error("Failed to get assistant ID:", error)
      return null
    }
  }, [])

  const handleFileUpload = useCallback(async (file: File) => {
    setIsAnalyzing(true)

    const userMsg: MessageModel = {
      id: Date.now().toString(),
      role: "user",
      content: `อัปโหลดกรมธรรม์: ${file.name}`,
      createdAt: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      console.log("Uploading & Preparing Vector Store...")
      const { vectorStoreId } = await repository.uploadPolicyFile(file)

      await repository.initializeAssistant(vectorStoreId)

      console.log("Analyzing Policy with OCR...")
      const analysis = await policyAnalysisService.analyzePolicy(file)
      console.log("analysis", analysis)

      const mapIcon = (type: string) => {
        switch (type) {
          case "Car":
            return Car
          case "Health":
            return Shield
          case "Home":
            return Home
          default:
            return FileText
        }
      }

      const newPolicy: PolicyModel = {
        id: Date.now().toString(),
        name: analysis.name || file.name,
        number: analysis.number || "N/A",
        status: analysis.status || "Unknown",
        expiry: analysis.expiry || "N/A",
        holder: analysis.holder || "N/A",
        type: analysis.type,
        icon: mapIcon(analysis.type),
        color:
          analysis.status === "Active"
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-600",
        summary: analysis.summary,
        content: analysis.content,
      }
      setPolicies((prev) => [...prev, newPolicy])

      const aiMsg: MessageModel = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `**ผลการวิเคราะห์:**\n\n${analysis.summary}`,
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (error) {
      console.error("Error in policy flow:", error)
      const errorMsg: MessageModel = {
        id: Date.now().toString(),
        role: "assistant",
        content: "ขออภัย เกิดข้อผิดพลาดในการวิเคราะห์กรมธรรม์",
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      const userMsg: MessageModel = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])

      // Get assistant ID (will be created if doesn't exist)
      const assistantId = await getAssistantId()
      if (!assistantId) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "กรุณาอัปโหลดกรมธรรม์ก่อนเพื่อเริ่มใช้งาน",
            createdAt: Date.now(),
          },
        ])
        return
      }

      try {
        setIsAnalyzing(true)
        const { response, conversationId: updatedConvId } =
          await repository.sendMessage(
            text,
            assistantId,
            conversationId || undefined,
          )

        if (updatedConvId) setConversationId(updatedConvId)

        const aiMsg: MessageModel = {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
          createdAt: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } catch (err) {
        console.error("Chat Error:", err)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "ขออภัย เกิดข้อผิดพลาด",
            createdAt: Date.now(),
          },
        ])
      } finally {
        setIsAnalyzing(false)
      }
    },
    [conversationId, getAssistantId],
  )

  return {
    messages,
    policies,
    isAnalyzing,
    handleFileUpload,
    handleSendMessage,
  }
}
