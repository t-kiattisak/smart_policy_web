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
          <h3 className='font-semibold text-gray-900 mb-1 truncate'>
            {policy.name}
          </h3>
          <div className='space-y-1 text-sm text-gray-600'>
            <div className='flex items-center gap-2'>
              <span className='text-gray-500'>เลขที่:</span>
              <span className='font-mono font-medium'>{policy.number}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-gray-500'>ผู้เอาประกัน:</span>
              <span className='font-medium'>{policy.holder}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-gray-500'>วันหมดอายุ:</span>
              <span className='font-medium'>{policy.expiry}</span>
            </div>
          </div>
          <div className='mt-3 flex items-center justify-between'>
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                policy.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600",
              )}
            >
              {policy.status === "Active" ? "คุ้มครอง" : "หมดอายุ"}
            </span>
            {onViewDetails && (
              <span className='text-xs text-blue-600 hover:text-blue-700 font-medium'>
                ดูรายละเอียด →
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
