import { generateExcelBuffer } from "./excelWriter"
import { saveAs } from "file-saver"

// Set this to your deployed Render/Railway URL later!
const BACKEND_URL = "http://localhost:3001/api/convert"

export async function generatePDF(headerData, normData, sheet1Data) {
  // 1. Generate the exact same Excel file buffer as the download
  const excelBuffer = await generateExcelBuffer(headerData, normData, sheet1Data)

  // 2. Create a FormData object to send to the backend
  const formData = new FormData()
  
  // Convert ArrayBuffer to Blob for uploading
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  formData.append("file", blob, "report.xlsx")

  // 3. Send it to the LibreOffice backend
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Failed to generate PDF. Is the backend running at ${BACKEND_URL}?`)
  }

  // 4. Download the generated PDF
  const pdfBlob = await response.blob()
  const month = headerData.month || ""
  const year = headerData.year || ""
  saveAs(pdfBlob, `ASHA_Report_${month}_${year}.pdf`)
}
