import { useState, useEffect, useRef, useCallback, useMemo } from "react"

interface UseSpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (text: string) => void
  onError?: (error: string) => void
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function useSpeechRecognition({
  language = "th-TH",
  continuous = false,
  interimResults = true,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")

  // Check browser support once
  const SpeechRecognition = useMemo(() => {
    if (typeof globalThis === "undefined") return null
    const win = globalThis as unknown as Window
    return win.SpeechRecognition || win.webkitSpeechRecognition || null
  }, [])

  const isSupported = SpeechRecognition !== null
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (!SpeechRecognition) {
      return
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.results.length - 1; i >= 0; i--) {
        const result = event.results.item(i)
        const transcript = result.item(0).transcript

        if (result.isFinal) {
          finalTranscript = transcript + " " + finalTranscript
        } else {
          interimTranscript = transcript + " " + interimTranscript
        }
      }

      const fullTranscript = finalTranscript || interimTranscript
      setTranscript(fullTranscript.trim())

      if (finalTranscript && onResult) {
        onResult(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
      if (onError) {
        onError(event.error)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore errors when stopping
        }
      }
    }
  }, [
    SpeechRecognition,
    language,
    continuous,
    interimResults,
    onResult,
    onError,
  ])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    try {
      setTranscript("")
      recognitionRef.current.start()
      setIsListening(true)
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      setIsListening(false)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return

    try {
      recognitionRef.current.stop()
      setIsListening(false)
    } catch (error) {
      console.error("Failed to stop speech recognition:", error)
      setIsListening(false)
    }
  }, [isListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  }
}
