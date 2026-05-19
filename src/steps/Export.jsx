import { useState } from "react"
import { generateExcel } from "../utils/excelWriter"
import { generatePDF } from "../utils/pdfExport"

export default function Export({ headerData, normData, sheet1Data, onBack }) {
  const [xlLoading, setXlLoading] = useState(false)
  const [xlDone, setXlDone] = useState(false)
  const [xlError, setXlError] = useState(null)

  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfDone, setPdfDone] = useState(false)
  const [pdfError, setPdfError] = useState(null)

  const handleExcel = async () => {
    setXlLoading(true)
    setXlError(null)
    try {
      await generateExcel(headerData, normData, sheet1Data)
      setXlDone(true)
    } catch (err) {
      console.error(err)
      setXlError("Excel generation failed. Check console for details.")
    }
    setXlLoading(false)
  }

  const handlePDF = async () => {
    setPdfLoading(true)
    setPdfError(null)
    try {
      await generatePDF(headerData, normData, sheet1Data)
      setPdfDone(true)
    } catch (err) {
      console.error(err)
      setPdfError("PDF generation failed. Is the Render server live? Check console for details.")
    }
    setPdfLoading(false)
  }

  const btnBase = {
    padding: "12px 28px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }

  return (
    <div>
      <h2 style={{ marginBottom: "8px", color: "#2c5282" }}>Step 4 — Export</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        All data collected. Download your filled Excel file or a ready-to-print PDF.
      </p>

      {/* Checklist */}
      <div style={{
        background: "#f0fff4", border: "1px solid #9ae6b4",
        borderRadius: "8px", padding: "16px", marginBottom: "24px"
      }}>
        {[
          "Header info filled",
          "Sheet 3 targets entered",
          "Sheet 1 daily data entered",
          "Sheet 2 auto-calculates from formulas"
        ].map(t => (
          <p key={t} style={{ color: "#276749", fontWeight: "bold", margin: "2px 0" }}>✓ {t}</p>
        ))}
      </div>

      {/* Error messages */}
      {xlError && (
        <div style={{
          background: "#fff5f5", border: "1px solid #feb2b2",
          borderRadius: "8px", padding: "12px", marginBottom: "12px", color: "#c53030"
        }}>{xlError}</div>
      )}
      {pdfError && (
        <div style={{
          background: "#fff5f5", border: "1px solid #feb2b2",
          borderRadius: "8px", padding: "12px", marginBottom: "12px", color: "#c53030"
        }}>{pdfError}</div>
      )}

      {/* Success messages */}
      {xlDone && (
        <div style={{
          background: "#f0fff4", border: "1px solid #9ae6b4",
          borderRadius: "8px", padding: "12px", marginBottom: "12px", color: "#276749"
        }}>✓ Excel downloaded! Open it and verify your data.</div>
      )}
      {pdfDone && (
        <div style={{
          background: "#f0fff4", border: "1px solid #9ae6b4",
          borderRadius: "8px", padding: "12px", marginBottom: "12px", color: "#276749"
        }}>✓ PDF downloaded successfully!</div>
      )}

      {/* Download buttons */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>

        {/* Excel */}
        <button
          onClick={handleExcel}
          disabled={xlLoading}
          style={{
            ...btnBase,
            background: xlLoading ? "#a0aec0" : "#2c5282",
            cursor: xlLoading ? "not-allowed" : "pointer"
          }}
        >
          <span>📊</span>
          {xlLoading ? "Generating Excel..." : "Download Excel (.xlsx)"}
        </button>

        {/* PDF */}
        <button
          onClick={handlePDF}
          disabled={pdfLoading}
          style={{
            ...btnBase,
            background: pdfLoading ? "#a0aec0" : "#c53030",
            cursor: pdfLoading ? "not-allowed" : "pointer"
          }}
        >
          <span>📄</span>
          {pdfLoading ? "Generating PDF..." : "Download PDF Replica"}
        </button>

      </div>

      <button onClick={onBack} style={{
        padding: "10px 28px", background: "#e2e8f0",
        border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px"
      }}>← Back</button>
    </div>
  )
}