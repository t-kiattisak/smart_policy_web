import { AzureOpenAI } from "openai"

const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT
const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY
const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT
const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION

if (!endpoint || !apiKey || !deployment) {
  console.warn("Azure OpenAI credentials are missing. Please check .env.local")
}

export const client = new AzureOpenAI({
  endpoint,
  apiKey,
  apiVersion,
  deployment,
  dangerouslyAllowBrowser: true,
})

export interface AnalyzedPolicy {
  name: string
  number: string
  holder: string
  insurer: string
  status: "Active" | "Expired" | "Pending"
  expiry: string
  type: "Car" | "Health" | "Home" | "Other"
  summary: string
  content: string
}

export const uploadFile = async (file: File) => {
  const uploadedFile = await client.files.create({
    file: file,
    purpose: "assistants",
  })
  return uploadedFile
}

export const createVectorStore = async (name: string) => {
  const vectorStore = await client.vectorStores.create({
    name: name,
  })
  return vectorStore
}

export const addFileToVectorStore = async (
  vectorStoreId: string,
  fileId: string,
) => {
  await client.vectorStores.files.create(vectorStoreId, {
    file_id: fileId,
  })
}
