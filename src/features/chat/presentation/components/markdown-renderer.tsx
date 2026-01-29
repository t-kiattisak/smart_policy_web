import ReactMarkdown from "react-markdown"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: Readonly<MarkdownRendererProps>) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ ...props }) => (
          <h1
            className='text-lg font-bold text-gray-900 mt-4 mb-2'
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <h2
            className='text-base font-semibold text-gray-800 mt-3 mb-2'
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3
            className='text-sm font-semibold text-gray-800 mt-2 mb-1'
            {...props}
          />
        ),
        p: ({ ...props }) => (
          <p
            className='(text-sm text-gray-800 leading-relaxed mb-0 whitespace-pre-wrap'
            {...props}
          />
        ),
        ul: ({ ...props }) => (
          <ul
            className='list-disc list-outside ml-4 mb-2 space-y-1'
            {...props}
          />
        ),
        ol: ({ ...props }) => (
          <ol
            className='list-decimal list-outside ml-4 mb-2 space-y-1'
            {...props}
          />
        ),
        li: ({ ...props }) => (
          <li className='text-sm text-gray-800 pl-1' {...props} />
        ),
        strong: ({ ...props }) => (
          <strong className='font-semibold text-gray-900' {...props} />
        ),
        blockquote: ({ ...props }) => (
          <blockquote
            className='border-l-4 border-blue-500 pl-3 py-1 my-2 bg-blue-50/50 rounded-r text-gray-600 italic text-sm'
            {...props}
          />
        ),
        code: ({ ...props }) => (
          <code
            className='bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200'
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
