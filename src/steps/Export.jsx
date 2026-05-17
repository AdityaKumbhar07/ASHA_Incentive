import { useState } from "react"
import { generateExcel } from "../utils/excelWriter"

export default function Export({ headerData, normData, sheet1Data, onBack }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      await generateExcel(headerData, normData, sheet1Data)
      setDone(true)
    } catch (err) {
      console.error(err)
      setError("Something went wrong. Check console for details.")
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 style={{ marginBottom: "8px", color: "#2c5282" }}>Step 4 — Export</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        All data collected. Ready to generate your filled Excel file.
      </p>

      <div style={{
        background: "#f0fff4", border: "1px solid #9ae6b4",
        borderRadius: "8px", padding: "16px", marginBottom: "24px"
      }}>
        <p style={{ color: "#276749", fontWeight: "bold" }}>✓ Header info filled</p>
        <p style={{ color: "#276749", fontWeight: "bold" }}>✓ Sheet 3 targets entered</p>
        <p style={{ color: "#276749", fontWeight: "bold" }}>✓ Sheet 1 daily data entered</p>
        <p style={{ color: "#276749", fontWeight: "bold" }}>✓ Sheet 2 auto-calculates from formulas</p>
      </div>

      {error && (
        <div style={{
          background: "#fff5f5", border: "1px solid #feb2b2",
          borderRadius: "8px", padding: "12px", marginBottom: "16px", color: "#c53030"
        }}>
          {error}
        </div>
      )}

      {done && (
        <div style={{
          background: "#f0fff4", border: "1px solid #9ae6b4",
          borderRadius: "8px", padding: "12px", marginBottom: "16px", color: "#276749"
        }}>
          ✓ Excel file downloaded successfully! Open it and check your data.
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          onClick={handleDownload}
          disabled={loading}
          style={{
            padding: "12px 32px",
            background: loading ? "#a0aec0" : "#2c5282",
            color: "white", border: "none", borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer", fontSize: "16px"
          }}
        >
          {loading ? "Generating..." : "⬇ Download Filled Excel"}
        </button>
      </div>

      <div style={{ marginTop: "24px" }}>
        <button onClick={onBack} style={{
          padding: "10px 28px", background: "#e2e8f0",
          border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px"
        }}>← Back</button>
      </div>
    </div>
  )
}