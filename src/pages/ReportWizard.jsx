import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import NormEntry from "../steps/NormEntry"
import Sheet1Entry from "../steps/Sheet1Entry"
import Preview from "../steps/Preview"
import Export from "../steps/Export"
import { useAuth } from "../contexts/AuthContext"

const STEPS = ["Targets (Sheet 3)", "Daily Data (Sheet 1)", "Preview", "Export"]

export default function ReportWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { month, year, prefillData, allReports, adminOverrideUser } = location.state || {};
  
  const { currentUser, logout, userData } = useAuth();
  
  const effectiveUser = adminOverrideUser || userData;
  const effectiveAuthUser = adminOverrideUser ? { email: effectiveUser.username + "@asha.internal" } : currentUser;

  const [currentStep, setCurrentStep] = useState(0)
  
  // Header data is now permanently fixed from the profile and selected month
  const headerData = {
    ashaName: effectiveUser?.ashaName || effectiveAuthUser?.email?.split('@')[0] || "",
    month: month || "Unknown",
    year: year || new Date().getFullYear().toString(),
    village: effectiveUser?.village || "",
    district: effectiveUser?.district || "",
    taluka: effectiveUser?.taluka || "",
    phc: effectiveUser?.phc || "",
    sc: effectiveUser?.sc || ""
  };

  // Form states
  const [normData, setNormData] = useState(prefillData?.normData || {})
  const [sheet1Data, setSheet1Data] = useState(prefillData?.sheet1Data || {})
  
  const next = () => setCurrentStep(s => s + 1)
  const back = () => setCurrentStep(s => s - 1)

  const handleCopyFromMonth = (e) => {
    const selectedMonth = e.target.value;
    if (!selectedMonth) return;
    const pastReport = allReports[selectedMonth];
    if (pastReport?.formData) {
      setNormData(pastReport.formData.normData || {});
      setSheet1Data(pastReport.formData.sheet1Data || {});
      alert(`Successfully copied data from ${selectedMonth}!`);
    }
  };

  // Ensure they didn't navigate here manually without a month
  if (!month || !year) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Invalid report session.</p>
        <button onClick={() => navigate('/')}>Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "1100px",
      margin: "40px auto",
      padding: "24px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "16px" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: "8px 12px", background: "#edf2f7", border: "1px solid #cbd5e0", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            ← Dashboard
          </button>
          <h1 style={{ color: "#2c5282", margin: 0 }}>{month} {year} Report</h1>
        </div>
        
        {/* Copy from past month dropdown */}
        {allReports && Object.keys(allReports).length > 0 && currentStep < 2 && (
          <div style={{ background: '#ebf8ff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #bee3f8' }}>
            <label style={{ marginRight: '8px', fontWeight: 'bold', color: '#2b6cb0', fontSize: '14px' }}>Copy Data From:</label>
            <select onChange={handleCopyFromMonth} defaultValue="" style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #90cdf4' }}>
              <option value="" disabled>Select Month...</option>
              {Object.keys(allReports).map(m => {
                if (m === month) return null; // Don't allow copying from the current month
                return <option key={m} value={m}>{m}</option>;
              })}
            </select>
          </div>
        )}
      </div>

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

      {currentStep === 0 && <NormEntry data={normData} setData={setNormData} onNext={next} />}
      {currentStep === 1 && <Sheet1Entry data={sheet1Data} setData={setSheet1Data} onNext={next} onBack={back} />}
      {currentStep === 2 && <Preview headerData={headerData} normData={normData} sheet1Data={sheet1Data} onBack={back} onPrint={next} adminOverrideUser={adminOverrideUser} />}
      {currentStep === 3 && <Export headerData={headerData} normData={normData} sheet1Data={sheet1Data} onBack={back} />}
    </div>
  )
}
