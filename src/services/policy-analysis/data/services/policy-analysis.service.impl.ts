import type { PolicyAnalysisService } from "../../domain/services/policy-analysis.service"
import type { AnalyzedPolicyData } from "../../domain/models/analyzed-policy.model"
import { convertPDFToImages } from "@/shared/lib/pdf-parser"
import { client } from "@/shared/lib/openai"
import { ANALYSIS_PROMPT } from "../prompts"

const DEPLOYMENT = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT

export class PolicyAnalysisServiceImpl implements PolicyAnalysisService {
  async analyzePolicy(file: File): Promise<AnalyzedPolicyData> {
    console.log("Converting PDF to images...")
    const images = await convertPDFToImages(file)

    if (images.length === 0) {
      throw new Error("Failed to convert PDF to images")
    }

    const messages = [
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: ANALYSIS_PROMPT,
          },
          ...images.map((imageBase64) => ({
            type: "image_url" as const,
            image_url: {
              url: imageBase64,
            },
          })),
        ],
      },
    ]

    console.log("Calling OpenAI Vision API for OCR analysis...")
    const response = await client.chat.completions.create({
      model: DEPLOYMENT,
      messages: messages,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error("No response from OpenAI Vision API")
    }

    try {
      let jsonContent = content.trim()
      const regex = /\{[\s\S]*\}/
      const jsonMatch = regex.exec(jsonContent)
      if (jsonMatch) {
        jsonContent = jsonMatch[0]
      }

      const parsed = JSON.parse(jsonContent) as AnalyzedPolicyData

      if (!parsed.name || !parsed.type) {
        return {
          name: parsed.name || "Unknown",
          number: parsed.number || "N/A",
          holder: parsed.holder || "N/A",
          insurer: parsed.insurer || "N/A",
          status: parsed.status || "Pending",
          expiry: parsed.expiry || "N/A",
          type: parsed.type || "Other",
          summary: parsed.summary || content,
          content: parsed.content || content,
        }
      }

      return parsed
    } catch (error) {
      console.error(
        "Failed to parse JSON response:",
        error,
        "Content:",
        content,
      )

      return {
        name: "Unknown",
        number: "N/A",
        holder: "N/A",
        insurer: "N/A",
        status: "Pending",
        expiry: "N/A",
        type: "Other",
        summary: content,
        content: content,
      }
    }
  }
}
