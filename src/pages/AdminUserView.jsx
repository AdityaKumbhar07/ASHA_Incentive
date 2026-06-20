import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AdminUserView() {
  const { userId } = useParams();
  const [targetUser, setTargetUser] = useState(null);
  const [reports, setReports] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch User Profile
        const uDoc = await getDoc(doc(db, "users", userId));
        if (uDoc.exists()) setTargetUser(uDoc.data());

        // Fetch Reports
        const q = query(collection(db, "reports"), where("userId", "==", userId), where("year", "==", selectedYear));
        const snap = await getDocs(q);
        const fetched = {};
        snap.forEach(d => {
           const data = d.data();
           fetched[data.month] = { id: d.id, ...data };
        });
        setReports(fetched);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchData();
  }, [userId, selectedYear]);

  const handleMonthClick = (month) => {
    // Route Admin into the wizard as if they were this user!
    navigate('/report', {
      state: {
        month,
        year: selectedYear,
        prefillData: reports[month]?.formData || null,
        allReports: reports,
        adminOverrideUser: { uid: userId, ...targetUser } // Crucial for saving correctly
      }
    });
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "24px", background: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/admin')}
          style={{ padding: "8px 12px", background: "#edf2f7", border: "1px solid #cbd5e0", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          ← Back to Admin
        </button>
        <div>
          <h1 style={{ color: "#2c5282", margin: 0, fontSize: '24px' }}>
            {targetUser?.ashaName ? `${targetUser.ashaName}'s Reports` : 'Loading...'}
          </h1>
          <p style={{ color: "#718096", margin: "4px 0 0 0" }}>
            {targetUser?.username} • PHC: {targetUser?.phc} • SC: {targetUser?.sc}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: "#4a5568", fontSize: '20px', margin: 0 }}>Select a Month to View or Edit</h2>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '16px', fontWeight: 'bold' }}
        >
          {[2024, 2025, 2026, 2027, 2028].map(y => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <p style={{ color: "#718096", textAlign: "center", padding: "40px" }}>Loading records...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {MONTHS.map(month => {
            const isCompleted = !!reports[month];
            return (
              <button 
                key={month}
                onClick={() => handleMonthClick(month)}
                style={{ 
                  border: isCompleted ? "2px solid #48bb78" : "1px solid #e2e8f0", 
                  padding: "24px 16px", 
                  borderRadius: "8px", 
                  background: isCompleted ? "#f0fff4" : "#f7fafc",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <strong style={{ fontSize: '18px', color: isCompleted ? "#276749" : "#4a5568" }}>{month}</strong>
                <span style={{ padding: "4px 12px", background: isCompleted ? "#c6f6d5" : "#edf2f7", color: isCompleted ? "#22543d" : "#a0aec0", borderRadius: "99px", fontSize: "12px", fontWeight: "bold" }}>
                  {isCompleted ? "Completed (Click to Edit)" : "Empty"}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}
