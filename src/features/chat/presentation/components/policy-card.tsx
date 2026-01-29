import { Card } from "@/shared/components/card"
import type { PolicyModel } from "@/features/chat/domain/models/policy.model"
import { cn } from "@/shared/lib/utils"

interface PolicyCardProps {
  policy: PolicyModel
  onViewDetails?: () => void
}

export function PolicyCard({
  policy,
  onViewDetails,
}: Readonly<PolicyCardProps>) {
  // Extract first 2-3 sentences from summary for preview
  const getSummaryPreview = (summary?: string) => {
    if (!summary) return null
    // Remove markdown headers and get first paragraph or first 200 chars
    const cleaned = summary
      .replaceAll(/^###+\s*/gm, "")
      .replaceAll(/\*\*/g, "")
      .trim()
    const sentences = cleaned.split(/[.!?]\s+/).filter((s) => s.length > 10)
    return (
      sentences.slice(0, 2).join(". ") + (sentences.length > 2 ? "..." : "")
    )
  }

  const summaryPreview = getSummaryPreview(policy.summary)

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-shadow border-2",
        policy.color || "bg-white",
      )}
      onClick={onViewDetails}
    >
      <div className='flex items-start gap-4'>
        {policy.icon && (
          <div className={cn("p-2 rounded-lg shrink-0", policy.color)}>
            <policy.icon className='w-6 h-6' />
          </div>
        )}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2 mb-2'>
            <h3 className='font-semibold text-gray-900 truncate'>
              {policy.name}
            </h3>
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full shrink-0",
                policy.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {policy.status === "Active" ? "คุ้มครอง" : "หมดอายุ"}
            </span>
          </div>

          {/* Summary Preview - Key Coverage Info */}
          {summaryPreview && (
            <div className='mb-3 p-2.5 bg-blue-50/50 rounded-md border border-blue-100'>
              <p className='text-xs font-medium text-blue-900 mb-1'>
                สรุปความคุ้มครอง:
              </p>
              <p className='text-xs text-gray-700 line-clamp-2 leading-relaxed'>
                {summaryPreview}
              </p>
            </div>
          )}

          <div className='space-y-1 text-sm text-gray-600'>
            <div className='flex items-center gap-2'>
              <span className='text-gray-500'>เลขที่:</span>
              <span className='font-mono font-medium'>{policy.number}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-gray-500'>ผู้เอาประกัน:</span>
              <span className='font-medium truncate'>{policy.holder}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-gray-500'>วันหมดอายุ:</span>
              <span className='font-medium'>{policy.expiry}</span>
            </div>
          </div>

          {onViewDetails && (
            <div className='mt-3 pt-3 border-t border-gray-200'>
              <span className='text-xs text-blue-600 hover:text-blue-700 font-medium'>
                ดูรายละเอียดและเงื่อนไขความคุ้มครอง →
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
