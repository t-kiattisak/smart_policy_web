import type { AnalyzedPolicyData } from "../models/analyzed-policy.model"

export interface PolicyAnalysisService {
  /**
   * Analyzes a policy PDF file by converting it to images and using OCR/Vision API
   * to extract structured policy data.
   */
  analyzePolicy(file: File): Promise<AnalyzedPolicyData>
}
