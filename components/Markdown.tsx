import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

// Renders admin-authored Markdown (transcripts, descriptions) with GFM + single-line
// breaks preserved. Styled via the .prose-faq rules in globals.css. Links open safely.
export default function Markdown({ children }: { children: string }) {
  if (!children?.trim()) return null
  return (
    <div className="prose-faq">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
