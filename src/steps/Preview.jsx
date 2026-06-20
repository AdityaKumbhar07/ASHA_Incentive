import { useState } from "react"
import { calculateSalary } from "../utils/salaryCalc"
import { useAuth } from "../contexts/AuthContext"
import { db } from "../config/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

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

const NORM_LABELS = [
  { key: "D3", label: "Estimated pregnancies registered" },
  { key: "D4", label: "Pregnant women received ANC" },
  { key: "D6", label: "Children immunization" },
  { key: "D7", label: "CBAC form filled" },
  { key: "D12", label: "OPD cases" },
  { key: "D14", label: "Referral monitoring" },
  { key: "D19", label: "Footfalls" },
]

export default function Preview({ headerData, normData, sheet1Data, onBack, onPrint, adminOverrideUser }) {
  const [activeTab, setActiveTab] = useState(0)
  const { currentUser, userData } = useAuth();
  
  const effectiveUserId = adminOverrideUser ? adminOverrideUser.uid : currentUser.uid;
  const effectiveUsername = adminOverrideUser ? adminOverrideUser.username : (currentUser.email?.split('@')[0] || "Unknown");
  const effectivePhc = adminOverrideUser ? adminOverrideUser.phc : (userData?.phc || "Unknown");
  const effectiveSc = adminOverrideUser ? adminOverrideUser.sc : (userData?.sc || "Unknown");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { rows: salaryRows, totalPayment } = calculateSalary(normData, sheet1Data)

  const handleLooksGood = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const reportId = `${effectiveUserId}_${headerData.month}_${headerData.year}`;
      const reportData = {
        userId: effectiveUserId,
        username: effectiveUsername,
        phc: effectivePhc,
        subCenter: effectiveSc,
        month: headerData.month,
        year: headerData.year,
        createdAt: serverTimestamp(),
        formData: {
          headerData,
          normData,
          sheet1Data
        }
      };

      await setDoc(doc(db, "reports", reportId), reportData);
      onPrint(); // proceed to Export step
    } catch (err) {
      console.error("Auto-save failed:", err);
      setSaveError("Failed to auto-save your data. Please check your connection.");
      setSaving(false);
    }
  };

  const sheet1Rows = INDICATORS.map((name, i) => {
    const values = sheet1Data[i] || new Array(31).fill(0)
    const total = values.reduce((a, b) => a + (Number(b) || 0), 0)
    return { name, values, total }
  })

  const thStyle = {
    padding: "6px 8px",
    background: "#2c5282",
    color: "white",
    fontSize: "11px",
    textAlign: "center",
    border: "1px solid #1a365d",
    whiteSpace: "nowrap"
  }

  const tdStyle = {
    padding: "4px 6px",
    fontSize: "11px",
    border: "1px solid #cbd5e0",
    textAlign: "center"
  }

  const tabStyle = (i) => ({
    padding: "10px 24px",
    background: activeTab === i ? "#2c5282" : "#e2e8f0",
    color: activeTab === i ? "white" : "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: activeTab === i ? "bold" : "normal"
  })

  return (
    <div>
      <h2 style={{ marginBottom: "4px", color: "#2c5282" }}>Preview — Verify Your Data</h2>
      <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
        Check all sheets carefully before printing.
      </p>

      {saveError && (
        <div style={{ background: "#fff5f5", color: "#c53030", padding: "12px", borderRadius: "8px", border: "1px solid #feb2b2", marginBottom: "16px" }}>
          {saveError}
        </div>
      )}

      {/* Header summary */}
      <div style={{
        background: "#ebf4ff", padding: "12px 16px",
        borderRadius: "8px", marginBottom: "20px",
        display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px"
      }}>
        <span><b>Name:</b> {headerData.ashaName}</span>
        <span><b>Month:</b> {headerData.month}</span>
        <span><b>Village:</b> {headerData.village}</span>
        <span><b>District:</b> {headerData.district}</span>
        <span><b>Taluka:</b> {headerData.taluka}</span>
        <span><b>PHC:</b> {headerData.phc}</span>
        <span><b>SC:</b> {headerData.sc}</span>
      </div>

      {/* Salary highlight */}
      <div style={{
        background: totalPayment > 0 ? "#f0fff4" : "#fff5f5",
        border: `1px solid ${totalPayment > 0 ? "#9ae6b4" : "#feb2b2"}`,
        borderRadius: "8px", padding: "12px 20px",
        marginBottom: "20px", display: "flex",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontWeight: "bold", fontSize: "15px" }}>Total Calculated Salary</span>
        <span style={{
          fontSize: "24px", fontWeight: "bold",
          color: totalPayment > 0 ? "#276749" : "#c53030"
        }}>₹ {totalPayment}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button style={tabStyle(0)} onClick={() => setActiveTab(0)}>Sheet 1 — Daily Data</button>
        <button style={tabStyle(1)} onClick={() => setActiveTab(1)}>Sheet 2 — Salary</button>
        <button style={tabStyle(2)} onClick={() => setActiveTab(2)}>Sheet 3 — Targets</button>
      </div>

      <div style={{ overflowX: "auto" }}>

        {/* SHEET 1 */}
        {activeTab === 0 && (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: "left", width: "200px" }}>Indicator</th>
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i} style={thStyle}>{i + 1}</th>
                ))}
                <th style={thStyle}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sheet1Rows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f7fafc" }}>
                  <td style={{ ...tdStyle, textAlign: "left", fontSize: "10px" }}>{row.name}</td>
                  {row.values.map((v, j) => (
                    <td key={j} style={{ ...tdStyle, background: v > 0 ? "#ebf8ff" : "" }}>
                      {v || ""}
                    </td>
                  ))}
                  <td style={{ ...tdStyle, fontWeight: "bold", background: "#fefcbf" }}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* SHEET 2 */}
        {activeTab === 1 && (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: "left" }}>Indicator</th>
                <th style={thStyle}>Performance</th>
                <th style={thStyle}>Target</th>
                <th style={thStyle}>% Achievement</th>
                <th style={thStyle}>Rule</th>
                <th style={{ ...thStyle, background: "#276749" }}>Payment (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {salaryRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f7fafc" }}>
                  <td style={{ ...tdStyle, textAlign: "left", fontSize: "10px" }}>{row.name}</td>
                  <td style={tdStyle}>{row.performance}</td>
                  <td style={tdStyle}>{row.target}</td>
                  <td style={tdStyle}>{row.achievement !== "-" ? `${row.achievement}%` : "-"}</td>
                  <td style={{ ...tdStyle, fontSize: "10px" }}>{row.rule}</td>
                  <td style={{
                    ...tdStyle, fontWeight: "bold",
                    color: row.payment > 0 ? "#276749" : "#c53030"
                  }}>₹ {row.payment}</td>
                </tr>
              ))}
              <tr style={{ background: "#f0fff4" }}>
                <td colSpan={5} style={{ ...tdStyle, textAlign: "right", fontWeight: "bold", fontSize: "14px" }}>
                  TOTAL SALARY
                </td>
                <td style={{ ...tdStyle, fontWeight: "bold", fontSize: "18px", color: "#276749" }}>
                  ₹ {totalPayment}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* SHEET 3 */}
        {activeTab === 2 && (
          <table style={{ borderCollapse: "collapse", width: "50%" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: "left" }}>Indicator</th>
                <th style={thStyle}>SC Target</th>
              </tr>
            </thead>
            <tbody>
              {NORM_LABELS.map((n, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f7fafc" }}>
                  <td style={{ ...tdStyle, textAlign: "left" }}>{n.label}</td>
                  <td style={{ ...tdStyle, fontWeight: "bold" }}>{normData[n.key] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button onClick={onBack} disabled={saving} style={{
          padding: "10px 28px", background: "#e2e8f0",
          border: "none", borderRadius: "6px", cursor: saving ? "not-allowed" : "pointer", fontSize: "15px"
        }}>← Back & Fix</button>
        <button onClick={handleLooksGood} disabled={saving} style={{
          padding: "12px 32px", background: saving ? "#a0aec0" : "#38a169",
          color: "white", border: "none", borderRadius: "6px",
          cursor: saving ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: "bold"
        }}>
          {saving ? "Auto-Saving to Cloud..." : "✓ Looks Good — Proceed to Export"}
        </button>
      </div>
    </div>
  )
}