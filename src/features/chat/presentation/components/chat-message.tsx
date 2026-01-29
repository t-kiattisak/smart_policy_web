import { Avatar } from "@/shared/components/avatar"
import { cn } from "@/shared/lib/utils"
import { useSpeechSynthesis } from "@/shared/hooks/use-speech-synthesis"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/shared/components/button"

interface ChatMessageProps {
  role: "user" | "agent"
  content?: string
  type?: "text" | "audio"
  children?: React.ReactNode
}

export function ChatMessage({
  role,
  content,
  type = "text",
  children,
}: Readonly<ChatMessageProps>) {
  const isUser = role === "user"
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis({
    language: "th-TH",
    rate: 0.9,
    pitch: 1,
  })

  const handleSpeak = () => {
    if (!content) return

    if (isSpeaking) {
      stop()
      return
    }

    // Remove markdown syntax for cleaner speech
    const cleanText = content
      .replaceAll(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replaceAll(/\*(.*?)\*/g, "$1") // Remove italic
      .replaceAll(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links, keep text
      .replaceAll(/#{1,6}\s/g, "") // Remove headers
      .replaceAll(/```[\s\S]*?```/g, "") // Remove code blocks
      .replaceAll(/`(.*?)`/g, "$1") // Remove inline code
      .replaceAll(/\n{2,}/g, ". ") // Replace multiple newlines with period
      .replaceAll(/\n/g, " ") // Replace single newlines with space
      .trim()
    console.log("cleanText", cleanText)
    if (cleanText) {
      speak(cleanText)
    }
  }

  return (
    <div
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex gap-4 max-w-full md:max-w-[70%]",
          isUser && "bg-gray-200 border border-gray-300 rounded-lg p-2",
          isUser ? "flex-row-reverse" : "md:flex-row flex-col",
        )}
      >
        <div className='shrink-0 mt-auto'>
          {!isUser && (
            <Avatar className='w-10 h-10 lg:w-12 lg:h-12 border-2 border-white shadow-sm'>
              <svg
                viewBox='0 -77.5 1179 1179'
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                fill='#000000'
              >
                <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
                <g
                  id='SVGRepo_tracerCarrier'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                ></g>
                <g id='SVGRepo_iconCarrier'>
                  <path
                    d='M597.215632 994.574713h403.714943s43.549425-8.945287 43.549425-114.64092 94.16092-577.677241-459.976092-577.677241-457.151264 541.425287-457.151264 541.425287-25.423448 160.77977 54.848735 157.013333 415.014253-6.12046 415.014253-6.120459z'
                    fill='#FFFFFF'
                  ></path>
                  <path
                    d='M1071.786667 712.798161h72.503908v136.297931h-72.503908zM36.016552 712.798161h72.503908v136.297931H36.016552z'
                    fill='#EA5D5C'
                  ></path>
                  <path
                    d='M305.68366 559.40926l556.254412-1.165018 0.398364 190.20464-556.254412 1.165018-0.398364-190.20464Z'
                    fill='#4C66AF'
                  ></path>
                  <path
                    d='M1129.931034 680.312644h-59.556781c-3.295632-152.069885-67.56046-258.942529-172.079081-324.384368l115.347127-238.462529a47.08046 47.08046 0 1 0-42.372414-20.48l-114.640919 236.57931a625.934713 625.934713 0 0 0-269.30023-53.200919 625.228506 625.228506 0 0 0-270.006437 54.848736l-115.817931-235.402299a47.08046 47.08046 0 1 0-42.372414 20.715402l117.701149 238.462529c-103.812414 65.441839-167.135632 173.02069-169.960459 324.61977H47.786667a47.08046 47.08046 0 0 0-47.08046 47.08046v117.701149a47.08046 47.08046 0 0 0 47.08046 47.08046h58.615172v57.908965a70.62069 70.62069 0 0 0 70.62069 70.62069l823.908046-1.647816a70.62069 70.62069 0 0 0 70.620689-70.62069v-57.908965h59.085977a47.08046 47.08046 0 0 0 47.08046-47.08046v-117.701149A47.08046 47.08046 0 0 0 1129.931034 680.312644zM94.16092 847.212874H47.08046v-117.70115h47.08046v117.70115z m929.83908 103.106206a23.54023 23.54023 0 0 1-23.54023 23.54023l-823.908046 1.647816a23.54023 23.54023 0 0 1-23.54023-23.540229v-258.942529c0-329.563218 303.668966-365.57977 434.788046-365.815173s435.494253 34.604138 436.20046 363.931954z m105.46023-105.224827h-47.08046v-117.70115h47.08046v117.70115z'
                    fill='#3F4651'
                  ></path>
                  <path
                    d='M464.684138 135.827126l22.363218-19.53839 40.018391 62.381609a30.131494 30.131494 0 0 0 25.423448 13.888735h2.824828a30.131494 30.131494 0 0 0 25.188046-19.067586l20.715402-79.095172 21.186207 74.387126v2.118621a30.366897 30.366897 0 0 0 52.494713 6.826667l30.366896-57.202759 13.182529 12.947126a30.131494 30.131494 0 0 0 21.186207 8.709886h57.673563a23.54023 23.54023 0 0 0 23.54023-23.54023 23.54023 23.54023 0 0 0-23.54023-23.54023h-50.140689l-23.54023-23.54023a30.366897 30.366897 0 0 0-45.668046 3.766437l-21.42161 40.01839L629.465747 19.302989a30.131494 30.131494 0 0 0-28.012873-19.067587 30.131494 30.131494 0 0 0-28.012874 19.067587l-26.60046 101.693793-29.660689-47.08046a30.366897 30.366897 0 0 0-20.48-13.653333 30.837701 30.837701 0 0 0-23.54023 6.826666l-32.250115 28.248276h-60.027586a23.54023 23.54023 0 0 0-23.54023 23.54023 23.54023 23.54023 0 0 0 23.54023 23.54023h66.148046a31.308506 31.308506 0 0 0 17.655172-6.591265zM776.121379 532.950805H404.421149A121.232184 121.232184 0 0 0 282.482759 639.352644a117.701149 117.701149 0 0 0 117.701149 129.000459h371.70023a121.232184 121.232184 0 0 0 121.938391-106.401839 117.701149 117.701149 0 0 0-117.70115-129.000459z m0 188.321839H402.302529a72.503908 72.503908 0 0 1-72.268506-56.496552 70.62069 70.62069 0 0 1 68.972874-84.744828h373.81885a72.503908 72.503908 0 0 1 72.268506 56.496552 70.62069 70.62069 0 0 1-68.502069 84.744828z'
                    fill='#3F4651'
                  ></path>
                </g>
              </svg>
            </Avatar>
          )}
        </div>

        {/* Bubble */}
        {children ? (
          <div className='w-full flex justify-start relative group'>
            {children}
            {!isUser && isSupported && (
              <Button
                variant='ghost'
                size='icon-sm'
                className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7'
                onClick={handleSpeak}
                title={isSpeaking ? "หยุดอ่าน" : "อ่านออกเสียง"}
              >
                {isSpeaking ? (
                  <VolumeX className='h-4 w-4 text-gray-600' />
                ) : (
                  <Volume2 className='h-4 w-4 text-gray-600' />
                )}
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "p-4 px-5 relative shadow-sm group",
              type === "audio"
                ? "rounded-2xl flex items-center gap-3 from-blue-500 to-blue-600 text-white shadow-blue-500/20"
                : isUser
                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                  : "bg-white/80 backdrop-blur-sm text-gray-700 border border-white/50 rounded-2xl rounded-tl-sm shadow-soft",
            )}
          >
            {type === "audio" ? (
              <>
                <span className='text-sm font-medium'>{content}</span>
                <div className='flex items-center gap-0.5 h-3'>
                  <div className='w-0.5 h-full bg-white/60 rounded-full animate-pulse'></div>
                  <div className='w-0.5 h-2/3 bg-white/60 rounded-full animate-pulse delay-75'></div>
                  <div className='w-0.5 h-full bg-white/60 rounded-full animate-pulse delay-150'></div>
                  <svg
                    className='w-4 h-4 text-white/80 ml-1'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M11 5L6 9H2v6h4l5 4V5zM15.5 12c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.02 1.5-3.34z' />
                  </svg>
                </div>
              </>
            ) : (
              <>
                <p className='leading-relaxed text-[15px] mb-0 pr-8'>
                  {content}
                </p>
                {!isUser && isSupported && (
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7'
                    onClick={handleSpeak}
                    title={isSpeaking ? "หยุดอ่าน" : "อ่านออกเสียง"}
                  >
                    {isSpeaking ? (
                      <VolumeX className='h-4 w-4 text-gray-600' />
                    ) : (
                      <Volume2 className='h-4 w-4 text-gray-600' />
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
