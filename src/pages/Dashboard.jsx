import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Dashboard() {
  const { currentUser, logout, userData } = useAuth();
  const [reports, setReports] = useState({}); // mapped by month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.role === 'admin') {
      navigate('/admin');
    }
  }, [userData, navigate]);

  useEffect(() => {
    async function fetchReports() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "reports"),
          where("userId", "==", currentUser.uid),
          where("year", "==", selectedYear)
        );
        const querySnapshot = await getDocs(q);
        const fetchedReports = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // We map the report to its month string so we can easily check the grid
          fetchedReports[data.month] = { id: doc.id, ...data };
        });
        setReports(fetchedReports);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
      setLoading(false);
    }
    fetchReports();
  }, [currentUser, selectedYear]);

  const handleMonthClick = (month) => {
    const existingData = reports[month];
    // We pass the month, year, and any existing data to the wizard
    navigate('/report', { 
      state: { 
        month, 
        year: selectedYear, 
        prefillData: existingData?.formData || null,
        allReports: reports 
      } 
    });
  };

  return (
    <div style={{
      maxWidth: "1000px",
      margin: "40px auto",
      padding: "24px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: "#2c5282", margin: 0, fontSize: '24px' }}>My Reports Dashboard</h1>
          <p style={{ color: "#718096", margin: "4px 0 0 0" }}>
            {userData?.ashaName ? userData.ashaName : currentUser?.email?.split('@')[0]} • {userData?.phc || "Unknown PHC"}
          </p>
        </div>
        <button 
          onClick={logout}
          style={{ padding: "8px 16px", background: "#fed7d7", color: "#c53030", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: "#4a5568", fontSize: '20px', margin: 0 }}>Select a Month</h2>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}
        >
          {/* Add a few years around the current year */}
          {[2024, 2025, 2026, 2027, 2028].map(y => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <p style={{ color: "#718096", textAlign: "center", padding: "40px" }}>Loading your reports...</p>
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <strong style={{ fontSize: '18px', color: isCompleted ? "#276749" : "#4a5568" }}>{month}</strong>
                <span style={{ 
                  padding: "4px 12px", 
                  background: isCompleted ? "#c6f6d5" : "#edf2f7", 
                  color: isCompleted ? "#22543d" : "#a0aec0", 
                  borderRadius: "99px", 
                  fontSize: "12px", 
                  fontWeight: "bold" 
                }}>
                  {isCompleted ? "Completed" : "Empty"}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}
