import { useState, useCallback, useRef, useEffect } from "react"

interface UseSpeechSynthesisOptions {
  language?: string
  pitch?: number
  rate?: number
  volume?: number
  onEnd?: () => void
  onError?: (error: string) => void
}

export function useSpeechSynthesis({
  language = "th-TH",
  pitch = 1,
  rate = 1,
  volume = 1,
  onEnd,
  onError,
}: UseSpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const isSupported =
    globalThis !== undefined &&
    "speechSynthesis" in globalThis &&
    (globalThis as unknown as Window).speechSynthesis !== undefined

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      const synth = (globalThis as unknown as Window).speechSynthesis

      // Stop any ongoing speech
      if (isSpeaking) {
        synth.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.pitch = pitch
      utterance.rate = rate
      utterance.volume = volume

      utterance.onend = () => {
        setIsSpeaking(false)
        utteranceRef.current = null
        if (onEnd) {
          onEnd()
        }
      }

      utterance.onerror = (event) => {
        setIsSpeaking(false)
        utteranceRef.current = null
        const errorMsg =
          event.error === "not-allowed"
            ? "ไม่อนุญาตให้อ่านออกเสียง"
            : "เกิดข้อผิดพลาดในการอ่านออกเสียง"
        console.error("Speech synthesis error:", event.error)
        if (onError) {
          onError(errorMsg)
        }
      }

      utteranceRef.current = utterance
      synth.speak(utterance)
      setIsSpeaking(true)
    },
    [isSupported, language, pitch, rate, volume, isSpeaking, onEnd, onError],
  )

  const stop = useCallback(() => {
    if (isSupported) {
      const synth = (globalThis as unknown as Window).speechSynthesis
      synth.cancel()
      setIsSpeaking(false)
      utteranceRef.current = null
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      const synth = (globalThis as unknown as Window).speechSynthesis
      synth.pause()
      setIsSpeaking(false)
    }
  }, [isSupported, isSpeaking])

  const resume = useCallback(() => {
    if (isSupported) {
      const synth = (globalThis as unknown as Window).speechSynthesis
      synth.resume()
      setIsSpeaking(true)
    }
  }, [isSupported])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        const synth = (globalThis as unknown as Window).speechSynthesis
        synth.cancel()
      }
    }
  }, [isSupported])

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
  }
}
