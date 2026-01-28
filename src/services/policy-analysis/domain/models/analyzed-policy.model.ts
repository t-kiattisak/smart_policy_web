export interface AnalyzedPolicyData {
  name: string
  number: string
  holder: string
  insurer: string
  status: string
  expiry: string
  type: "Car" | "Health" | "Home" | "Other"
  summary: string
  content: string
}
