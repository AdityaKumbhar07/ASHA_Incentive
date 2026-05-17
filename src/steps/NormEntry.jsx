const NORM_ROWS = [
  { key: "D3", label: "Estimated pregnancies registered (First Trimester)" },
  { key: "D4", label: "Pregnant women registered who received ANC" },
  { key: "D6", label: "Children up to 2 years who received immunization" },
  { key: "D7", label: "Above 30 years CBAC form filled" },
  { key: "D12", label: "Number of OPD cases (Old + New)" },
  { key: "D14", label: "Monitoring of Referral cases Upward and Downward" },
  { key: "D19", label: "Number of footfalls in the month" },
]

export default function NormEntry({ data, setData, onNext, onBack }) {
  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  const isComplete = NORM_ROWS.every(r => data[r.key]?.toString().trim())

  return (
    <div>
      <h2 style={{ marginBottom: "8px", color: "#2c5282" }}>Step 2 — Target Values (Sheet 3)</h2>
      <p style={{ color: "#666", marginBottom: "20px", fontSize: "13px" }}>
        Enter the SC target values. All other columns calculate automatically.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {NORM_ROWS.map(r => (
          <div key={r.key} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <label style={{ flex: 1, fontSize: "14px" }}>{r.label}</label>
            <input
              type="number"
              value={data[r.key] || ""}
              onChange={e => handleChange(r.key, e.target.value)}
              style={{
                width: "120px",
                padding: "8px 12px",
                border: "1px solid #cbd5e0",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button onClick={onBack} style={{
          padding: "10px 28px", background: "#e2e8f0",
          border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px"
        }}>← Back</button>
        <button onClick={onNext} disabled={!isComplete} style={{
          padding: "10px 28px",
          background: isComplete ? "#2c5282" : "#a0aec0",
          color: "white", border: "none", borderRadius: "6px",
          cursor: isComplete ? "pointer" : "not-allowed", fontSize: "15px"
        }}>Next →</button>
      </div>
    </div>
  )
}