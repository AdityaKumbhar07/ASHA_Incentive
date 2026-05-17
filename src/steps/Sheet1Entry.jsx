import { useState } from "react"

const INDICATORS = [
  "Proportion of estimated pregnancies registered (First Trimester)",
  "Proportion of pregnant women registered who received ANC",
  "Proportion of Newborns who received HBNC visits",
  "Proportion of Children up to 2 years who received immunization",
  "Proportion of above 30 years whose CBAC form was filled",
  "Proportion of above 30 years screened for Hypertension",
  "Proportion of patient of HYPERTENSION on Treatment",
  "Proportion of above 30 years screened for Diabetes Mellitus",
  "Proportion of patient of Diabetes Mellitus on Treatment",
  "Proportion of cases referred for TB Screening",
  "Monitoring of Referral cases Upward and Downward",
  "HWC Teleconsultation services provided",
  "Yoga Sessions organised & wellness activities held",
  "Monthly JAS Meeting Held at SHC-HWCs",
  "VHSND held against planned",
  "Number of footfalls in the month",
  "Home visits per month in the catchment area",
]

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

function randomSpread(total, days) {
  const values = new Array(31).fill(0)
  if (!days.length || total <= 0) return values
  
  const t = Math.round(total)
  const n = days.length
  
  // Generate n-1 random cut points
  let cuts = Array.from({length: n - 1}, () => Math.floor(Math.random() * (t + 1)))
  cuts = [0, ...cuts.sort((a, b) => a - b), t]
  
  for (let i = 0; i < n; i++) {
    values[days[i] - 1] = cuts[i + 1] - cuts[i]
  }
  
  return values
}

export default function Sheet1Entry({ data, setData, onNext, onBack }) {
  const [currentRow, setCurrentRow] = useState(0)
  const [mode, setMode] = useState("auto")
  const [total, setTotal] = useState("")
  const [selectedDays, setSelectedDays] = useState([])
  const [exactValues, setExactValues] = useState(new Array(31).fill(""))
  const [preview, setPreview] = useState(null)

  const saved = data[currentRow]

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleGenerate = () => {
    let values
    if (mode === "auto") {
      values = randomSpread(parseInt(total), DAYS.filter(() => Math.random() > 0.6))
    } else if (mode === "pick") {
      values = randomSpread(parseInt(total), selectedDays)
    } else {
      values = exactValues.map(v => parseInt(v) || 0)
    }
    setPreview(values)
  }

  const handleSave = () => {
    setData(prev => ({ ...prev, [currentRow]: preview }))
    if (currentRow < INDICATORS.length - 1) {
      setCurrentRow(r => r + 1)
      setMode("auto")
      setTotal("")
      setSelectedDays([])
      setExactValues(new Array(31).fill(""))
      setPreview(null)
    }
  }

  const isLastRow = currentRow === INDICATORS.length - 1
  const allSaved = Object.keys(data).length === INDICATORS.length

  return (
    <div>
      <h2 style={{ marginBottom: "4px", color: "#2c5282" }}>Step 3 — Daily Data (Sheet 1)</h2>
      <p style={{ color: "#666", fontSize: "13px", marginBottom: "16px" }}>
        Row {currentRow + 1} of {INDICATORS.length}
      </p>

      {/* Row progress */}
      <div style={{ background: "#e2e8f0", borderRadius: "6px", height: "8px", marginBottom: "20px" }}>
        <div style={{
          width: `${((currentRow + 1) / INDICATORS.length) * 100}%`,
          background: "#2c5282", height: "8px", borderRadius: "6px",
          transition: "width 0.3s"
        }} />
      </div>

      {/* Indicator name */}
      <div style={{
        background: "#ebf4ff", padding: "12px 16px",
        borderRadius: "8px", marginBottom: "20px",
        fontWeight: "bold", color: "#2c5282"
      }}>
        {INDICATORS[currentRow]}
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {[
          { val: "auto", label: "Auto Random" },
          { val: "pick", label: "Pick Dates" },
          { val: "exact", label: "Exact Per Day" }
        ].map(m => (
          <button key={m.val} onClick={() => { setMode(m.val); setPreview(null) }} style={{
            padding: "8px 16px",
            background: mode === m.val ? "#2c5282" : "#e2e8f0",
            color: mode === m.val ? "white" : "#333",
            border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px"
          }}>{m.label}</button>
        ))}
      </div>

      {/* Auto mode */}
      {mode === "auto" && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontWeight: "bold" }}>Monthly Total:</label>
          <input type="number" value={total} onChange={e => setTotal(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #cbd5e0", borderRadius: "6px", width: "120px" }} />
        </div>
      )}

      {/* Pick dates mode */}
      {mode === "pick" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <label style={{ fontWeight: "bold" }}>Monthly Total:</label>
            <input type="number" value={total} onChange={e => setTotal(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #cbd5e0", borderRadius: "6px", width: "120px" }} />
          </div>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Select dates to spread across:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {DAYS.map(d => (
              <button key={d} onClick={() => toggleDay(d)} style={{
                width: "36px", height: "36px",
                background: selectedDays.includes(d) ? "#2c5282" : "#e2e8f0",
                color: selectedDays.includes(d) ? "white" : "#333",
                border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px"
              }}>{d}</button>
            ))}
          </div>
        </div>
      )}

      {/* Exact mode */}
      {mode === "exact" && (
        <div>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Enter value for each day:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#666", marginBottom: "2px" }}>{d}</div>
                <input type="number" value={exactValues[i]}
                  onChange={e => {
                    const updated = [...exactValues]
                    updated[i] = e.target.value
                    setExactValues(updated)
                  }}
                  style={{ width: "42px", padding: "4px", border: "1px solid #cbd5e0", borderRadius: "4px", textAlign: "center", fontSize: "12px" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate button */}
      <button onClick={handleGenerate} style={{
        marginTop: "16px", padding: "10px 24px",
        background: "#38a169", color: "white",
        border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px"
      }}>Generate Preview</button>

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: "16px", background: "#f7fafc", padding: "12px", borderRadius: "8px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Preview — Total: {preview.reduce((a, b) => a + b, 0)}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {preview.map((v, i) => (
              <div key={i} style={{
                width: "36px", textAlign: "center", fontSize: "11px",
                background: v > 0 ? "#bee3f8" : "#e2e8f0",
                padding: "4px", borderRadius: "4px"
              }}>
                <div style={{ color: "#666" }}>{i + 1}</div>
                <div style={{ fontWeight: "bold" }}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} style={{
            marginTop: "12px", padding: "10px 24px",
            background: "#2c5282", color: "white",
            border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px"
          }}>
            {isLastRow ? "Save & Finish" : "Save & Next Row →"}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button onClick={onBack} style={{
          padding: "10px 28px", background: "#e2e8f0",
          border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px"
        }}>← Back</button>
        {allSaved && (
          <button onClick={onNext} style={{
            padding: "10px 28px", background: "#2c5282",
            color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px"
          }}>Go to Export →</button>
        )}
      </div>
    </div>
  )
}