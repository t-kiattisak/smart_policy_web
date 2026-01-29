import { useState, useCallback, useEffect } from "react"
import { ChatRepositoryImpl } from "@/features/chat/data/repositories/chat.repository.impl"
import { PolicyAnalysisServiceImpl } from "@/services/policy-analysis"
import { Car, Shield, Home, FileText } from "lucide-react"
import { useGeolocation } from "@/shared/hooks/use-geolocation"
import type { MessageModel } from "@/features/chat/domain/models/message.model"
import type { PolicyModel } from "@/features/chat/domain/models/policy.model"

const repository = new ChatRepositoryImpl()
const policyAnalysisService = new PolicyAnalysisServiceImpl()

// Helper to reverse geocode coordinates to location name
const reverseGeocode = async (
  lat: number,
  lng: number,
): Promise<string | null> => {
  try {
    // Use OpenStreetMap Nominatim API (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "SmartPolicyApp/1.0",
        },
      },
    )
    const data = await response.json()
    if (data.address) {
      // Try to get district or city name
      return (
        data.address.district ||
        data.address.city ||
        data.address.state ||
        data.address.country ||
        null
      )
    }
    return null
  } catch {
    return null
  }
}

export function useChatController() {
  const [messages, setMessages] = useState<MessageModel[]>([])
  const [policies, setPolicies] = useState<PolicyModel[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<string | null>(null)

  const { position, getCurrentPosition, isSupported } = useGeolocation()

  // Get user location on mount (once)
  useEffect(() => {
    if (isSupported && !userLocation) {
      getCurrentPosition()
    }
  }, [isSupported, userLocation, getCurrentPosition])

  // Reverse geocode when position is available
  useEffect(() => {
    if (position && !userLocation) {
      reverseGeocode(position.latitude, position.longitude).then((location) => {
        if (location) {
          setUserLocation(location)
        }
      })
    }
  }, [position, userLocation])

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
        policy: newPolicy,
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

      const policyInfo =
        policies.length > 0
          ? `\n\n**กรมธรรม์ที่มีอยู่:**\n${policies.map((p) => `- **${p.name}** (เลขที่: ${p.number})`).join("\n")}`
          : ""

      const messageWithContext = `${text}${policyInfo}`

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
            messageWithContext,
            assistantId,
            conversationId ?? undefined,
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
    [conversationId, getAssistantId, policies],
  )

  return {
    messages,
    policies,
    isAnalyzing,
    handleFileUpload,
    handleSendMessage,
  }
}
