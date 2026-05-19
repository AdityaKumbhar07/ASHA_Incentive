import { useState } from "react"
import HeaderEntry from "./steps/HeaderEntry"
import NormEntry from "./steps/NormEntry"
import Sheet1Entry from "./steps/Sheet1Entry"
import Preview from "./steps/Preview"
import Export from "./steps/Export"

const STEPS = ["Header Info", "Targets (Sheet 3)", "Daily Data (Sheet 1)", "Preview", "Export"]

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [headerData, setHeaderData] = useState({})
  const [normData, setNormData] = useState({})
  const [sheet1Data, setSheet1Data] = useState({})

  const next = () => setCurrentStep(s => s + 1)
  const back = () => setCurrentStep(s => s - 1)

  return (
    <div style={{
      maxWidth: "1100px",
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
              height: "6px", borderRadius: "3px",
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
      {currentStep === 3 && <Preview headerData={headerData} normData={normData} sheet1Data={sheet1Data} onBack={back} onPrint={next} />}
      {currentStep === 4 && <Export headerData={headerData} normData={normData} sheet1Data={sheet1Data} onBack={back} />}
    </div>
  )
}

export default App