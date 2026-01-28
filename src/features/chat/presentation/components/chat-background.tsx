export function ChatBackground() {
  return (
    <div className='fixed inset-0 pointer-events-none overflow-hidden'>
      <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse-slow'></div>
      <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-200/30 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse-slow delay-1000'></div>
      <div className='absolute top-[20%] right-[30%] w-[30%] h-[30%] bg-purple-200/20 rounded-full blur-[100px] mix-blend-multiply opacity-50 animate-pulse-slow delay-700'></div>
    </div>
  )
}
