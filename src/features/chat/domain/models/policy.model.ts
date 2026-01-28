import type { LucideIcon } from "lucide-react"

export interface PolicyModel {
  id: string
  name: string
  number: string
  status: string
  expiry: string
  holder: string
  type: "Car" | "Health" | "Home" | "Other"
  summary?: string
  content?: string

  // UI Helpers (Optional in pure domain, but practical here)
  color?: string
  icon?: LucideIcon
}
