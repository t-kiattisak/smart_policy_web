import React from "react"
import { Button } from "@/shared/components/button"
import { MicIcon, MousePointer2, CloudUploadIcon } from "lucide-react"
import { Input } from "@/shared/components/input"
import { useSpeechRecognition } from "@/shared/hooks/use-speech-recognition"
import { cn } from "@/shared/lib/utils"

interface ChatInputProps {
  onFileUpload: (file: File) => void
  onSendMessage?: (text: string) => void
  disabled?: boolean
}

export function ChatInput({
  onFileUpload,
  onSendMessage,
  disabled,
}: Readonly<ChatInputProps>) {
  const [input, setInput] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const finalTranscriptRef = React.useRef("")

  const handleSpeechResult = React.useCallback(
    (text: string) => {
      finalTranscriptRef.current = text
      setInput(text)
      // Auto-send when speech recognition completes
      if (text.trim() && onSendMessage && !disabled) {
        setTimeout(() => {
          onSendMessage(text)
          setInput("")
          finalTranscriptRef.current = ""
        }, 300)
      }
    },
    [onSendMessage, disabled],
  )

  const handleSpeechError = React.useCallback((error: string) => {
    console.error("Speech recognition error:", error)
    // You can show a toast notification here if needed
  }, [])

  const {
    isListening,
    transcript,
    isSupported,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    language: "th-TH",
    continuous: false,
    interimResults: true,
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  })

  // Update input with interim transcript while listening
  React.useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript)
    }
  }, [isListening, transcript])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && !disabled) {
      onFileUpload(file)
      e.target.value = ""
    }
  }

  const handleSend = () => {
    if (input.trim() && onSendMessage && !disabled) {
      // Stop listening if active
      if (isListening) {
        stopListening()
      }
      onSendMessage(input)
      setInput("")
      finalTranscriptRef.current = ""
    }
  }

  const handleMicClick = () => {
    if (disabled || !isSupported) return
    if (isListening) {
      stopListening()
      // If there's a final transcript, send it
      if (finalTranscriptRef.current.trim() && onSendMessage) {
        setTimeout(() => {
          onSendMessage(finalTranscriptRef.current)
          setInput("")
          finalTranscriptRef.current = ""
        }, 100)
      }
    } else {
      setInput("")
      finalTranscriptRef.current = ""
      toggleListening()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled) {
      handleSend()
    }
  }

  return (
    <div className='h-32'>
      <div className='p-4 md:p-6 pb-8 fixed left-0 right-0 bottom-0 z-20'>
        <div className='max-w-4xl mx-auto relative flex items-center gap-3'>
          <div className='relative'>
            <Input
              ref={fileInputRef}
              type='file'
              name='file-input'
              id='file-input'
              autoComplete='off'
              className='hidden'
              accept='.pdf'
              onChange={handleFileChange}
              disabled={disabled}
            />
            <Button
              size='icon'
              className='rounded-full bg-white/80 hover:bg-white text-gray-500 shadow-sm backdrop-blur-sm border border-white/50 h-10 w-10 shrink-0'
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <CloudUploadIcon className='w-5 h-5' />
            </Button>
          </div>

          <div className='flex-1 relative shadow-soft rounded-full'>
            <Input
              type='text'
              value={input}
              name='chat-input'
              id='chat-input'
              autoComplete='off'
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='พิมพ์แจ้งเหตุการณ์หรือสอบถาม...'
              className='w-full h-12 md:h-14 pl-6 pr-12 rounded-full bg-white/90 backdrop-blur-md border border-white/60 focus:outline-none focus:ring-2 focus:ring-blue-200/50 text-gray-700 placeholder:text-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={disabled}
            />
            <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
              <Button
                variant='ghost'
                size='icon'
                className='text-gray-400 hover:text-gray-600 rounded-full h-8 w-8'
                onClick={handleSend}
              >
                <MousePointer2 size={20} />
              </Button>
            </div>
          </div>

          <div className='relative shrink-0'>
            {isListening && (
              <>
                <span className='absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20'></span>
                <span className='absolute inset-[-4px] rounded-full from-blue-400 to-cyan-300 opacity-40 blur-sm'></span>
              </>
            )}

            <Button
              size='icon-lg'
              onClick={handleMicClick}
              disabled={disabled || !isSupported}
              className={cn(
                `rounded-full relative z-10 w-12 h-12 md:w-14 md:h-14 text-white shadow-lg border-2 border-white/20 transition-all`,
                isListening &&
                  "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
              )}
              title={(() => {
                if (!isSupported) {
                  return "Voice recognition not supported in this browser"
                }
                return isListening
                  ? "Click to stop recording"
                  : "Click to start voice input"
              })()}
            >
              <MicIcon className='w-6 h-6 md:w-7 md:h-7' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
