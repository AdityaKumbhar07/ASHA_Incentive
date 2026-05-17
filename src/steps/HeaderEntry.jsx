const fields = [
  { key: "ashaName", label: "ASHA Name" },
  { key: "month", label: "Month (e.g. April 2026)" },
  { key: "village", label: "Village" },
  { key: "district", label: "District" },
  { key: "taluka", label: "Taluka" },
  { key: "phc", label: "PHC" },
  { key: "sc", label: "SC" },
]

export default function HeaderEntry({ data, setData, onNext }) {
  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  const isComplete = fields.every(f => data[f.key]?.trim())

  return (
    <div>
      <h2 style={{ marginBottom: "20px", color: "#2c5282" }}>Step 1 — Header Information</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", fontSize: "13px" }}>
              {f.label}
            </label>
            <input
              value={data[f.key] || ""}
              onChange={e => handleChange(f.key, e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #cbd5e0",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!isComplete}
        style={{
          marginTop: "24px",
          padding: "10px 28px",
          background: isComplete ? "#2c5282" : "#a0aec0",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: isComplete ? "pointer" : "not-allowed",
          fontSize: "15px"
        }}
      >
        Next →
      </button>
    </div>
  )
}