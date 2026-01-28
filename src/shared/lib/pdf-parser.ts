import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export async function convertPDFToImages(file: File): Promise<string[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const images: string[] = []

    const maxPages = Math.min(pdf.numPages, 3)

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")

      if (!context) continue

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas,
      }).promise

      const base64 = canvas.toDataURL("image/jpeg", 0.8)
      images.push(base64)
    }

    return images
  } catch (error) {
    console.error("PDF to Image Conversion Failed:", error)
    throw new Error("Failed to convert PDF to images")
  }
}
