import { useState } from "react"
import { Button } from "@/shared/components/button"
import { MoreHorizontalIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dialog"

import type { PolicyModel } from "@/features/chat/domain/models/policy.model"
import { MarkdownRenderer } from "./markdown-renderer"

interface ChatHeaderProps {
  policies: PolicyModel[]
}

export function ChatHeader({ policies }: ChatHeaderProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyModel | null>(null)

  return (
    <>
      <div className='p-10' />
      <header className='flex items-center justify-between px-6 py-4 glass z-20 fixed top-0 left-0 right-0'>
        <div className='flex items-center gap-3'>
          <div className='bg-blue-500 rounded-lg p-1.5 shadow-md shadow-blue-500/20'>
            <svg
              className='w-5 h-5 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2.5}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M13 10V3L4 14h7v7l9-11h-7z'
              />
            </svg>
          </div>
          <h1 className='font-bold text-gray-800 text-lg tracking-tight'>
            Smart Policy
          </h1>
        </div>

        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='text-gray-500 hover:text-gray-700 data-[state=open]:bg-gray-100'
              >
                <MoreHorizontalIcon className='w-5 h-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64'>
              <div className='px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                เลือกกรมธรรม์
              </div>
              {policies.map((policy) => (
                <DropdownMenuItem
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy)}
                  className='p-3 cursor-pointer'
                >
                  <div className={`p-2 rounded-lg ${policy.color} mr-3`}>
                    {policy.icon && <policy.icon className='w-4 h-4' />}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-gray-900 truncate'>
                      {policy.name}
                    </p>
                    <p className='text-xs text-gray-500 truncate'>
                      {policy.number}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
      >
        <DialogContent className='sm:max-w-3xl'>
          {selectedPolicy && (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <div className={`p-1.5 rounded-md ${selectedPolicy.color}`}>
                    {selectedPolicy.icon && (
                      <selectedPolicy.icon className='w-5 h-5' />
                    )}
                  </div>
                  {selectedPolicy.name}
                </DialogTitle>
                <DialogDescription>รายละเอียดความคุ้มครอง</DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 max-h-[60vh] overflow-y-auto'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>เลขที่กรมธรรม์</span>
                    <span className='font-medium font-mono'>
                      {selectedPolicy.number}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>ผู้เอาประกัน</span>
                    <span className='font-medium'>{selectedPolicy.holder}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-500'>วันหมดอายุ</span>
                    <span className='font-medium'>{selectedPolicy.expiry}</span>
                  </div>

                  <div className='pt-2 border-t border-gray-200'>
                    <div className='markdown-content'>
                      <MarkdownRenderer
                        content={selectedPolicy.content || ""}
                      />
                    </div>
                  </div>

                  <div className='border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm'>
                    <span className='text-gray-500'>สถานะ</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        selectedPolicy.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {selectedPolicy.status === "Active"
                        ? "คุ้มครอง"
                        : "หมดอายุ"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button
                  variant='outline'
                  onClick={() => setSelectedPolicy(null)}
                >
                  ปิด
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
