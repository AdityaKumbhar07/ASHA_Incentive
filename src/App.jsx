import { useState, useEffect } from "react"
import HeaderEntry from "./steps/HeaderEntry"
import NormEntry from "./steps/NormEntry"
import Sheet1Entry from "./steps/Sheet1Entry"
import Export from "./steps/Export"

const STEPS = ["Header Info", "Targets (Sheet 3)", "Daily Data (Sheet 1)", "Export"]

function App() {
  const [currentStep, setCurrentStep] = useState(3)
  const [headerData, setHeaderData] = useState({})
  const [normData, setNormData] = useState({})
  const [sheet1Data, setSheet1Data] = useState({})

  useEffect(() => {
    setHeaderData({
      ashaName: "Test ASHA",
      month: "April 2026",
      village: "Tembhu",
      district: "Satara",
      taluka: "Test Taluka",
      phc: "Sadashivgad",
      sc: "Test SC"
    })
    setNormData({ D3: 10, D4: 20, D6: 15, D7: 30, D12: 50, D14: 5, D19: 100 })
    setSheet1Data(
      Object.fromEntries(
        Array.from({ length: 17 }, (_, i) => [i, new Array(31).fill(1)])
      )
    )
  }, [])

  const next = () => setCurrentStep(s => s + 1)
  const back = () => setCurrentStep(s => s - 1)

  return (
    <div style={{
      maxWidth: "850px",
      margin: "40px auto",
      padding: "24px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ color: "#2c5282", marginBottom: "4px" }}>ASHA Report Entry System</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>Guided data entry for ASHA monthly report</p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              height: "6px",
              borderRadius: "3px",
              background: i <= currentStep ? "#2c5282" : "#e2e8f0",
              marginBottom: "6px"
            }} />
            <span style={{
              fontSize: "11px",
              color: i === currentStep ? "#2c5282" : "#999",
              fontWeight: i === currentStep ? "bold" : "normal"
            }}>{step}</span>
          </div>
        ))}
      </div>

      {currentStep === 0 && <HeaderEntry data={headerData} setData={setHeaderData} onNext={next} />}
      {currentStep === 1 && <NormEntry data={normData} setData={setNormData} onNext={next} onBack={back} />}
      {currentStep === 2 && <Sheet1Entry data={sheet1Data} setData={setSheet1Data} onNext={next} onBack={back} />}
      {currentStep === 3 && <Export headerData={headerData} normData={normData} sheet1Data={sheet1Data} onBack={back} />}
    </div>
  )
}

export default App