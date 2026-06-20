import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', ashaName: '', phc: '', sc: '', village: '', district: '', taluka: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "user"));
      const snapshot = await getDocs(q);
      const fetched = [];
      snapshot.forEach(d => fetched.push({ id: d.id, ...d.data() }));
      setUsers(fetched);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      // Initialize a secondary Firebase app so we don't log the admin out
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);

      // Create the user in Auth
      const email = `${formData.username}@asha.internal`;
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, formData.password);
      const newUserId = userCredential.user.uid;

      // Save their permanent profile to Firestore
      await setDoc(doc(db, "users", newUserId), {
        role: "user",
        username: formData.username,
        ashaName: formData.ashaName,
        phc: formData.phc,
        sc: formData.sc,
        village: formData.village,
        district: formData.district,
        taluka: formData.taluka,
        createdAt: new Date()
      });

      // Sign out the secondary app and clean up
      await secondaryAuth.signOut();
      
      setShowModal(false);
      setFormData({ username: '', password: '', ashaName: '', phc: '', sc: '', village: '', district: '', taluka: '' });
      fetchUsers(); // refresh the list
    } catch (err) {
      console.error(err);
      setError("Failed to create user. Ensure the username is unique and password is at least 6 characters.");
    }
    setCreating(false);
  };

  const handleDeleteUser = async (userId, ashaName) => {
    if (window.confirm(`Are you sure you want to delete ${ashaName}? This will permanently remove their profile access.`)) {
      try {
        await deleteDoc(doc(db, "users", userId));
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "24px", background: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: "#2c5282", margin: 0, fontSize: '24px' }}>Admin Dashboard</h1>
          <p style={{ color: "#718096", margin: "4px 0 0 0" }}>Manage ASHA Workers & Reports</p>
        </div>
        <button onClick={logout} style={{ padding: "8px 16px", background: "#fed7d7", color: "#c53030", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          Logout Admin
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: "#4a5568", fontSize: '20px', margin: 0 }}>Registered ASHA Workers</h2>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: "10px 20px", background: "#38a169", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>+</span> Add New ASHA Worker
        </button>
      </div>
      
      {loading ? (
        <p style={{ color: "#718096", textAlign: "center", padding: "40px" }}>Loading workers...</p>
      ) : users.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', background: '#f7fafc', borderRadius: '8px', color: '#718096' }}>
          No ASHA workers found. Add your first worker above.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "12px", textAlign: "left", background: "#edf2f7", color: "#4a5568", borderBottom: "2px solid #cbd5e0" }}>ASHA Name</th>
              <th style={{ padding: "12px", textAlign: "left", background: "#edf2f7", color: "#4a5568", borderBottom: "2px solid #cbd5e0" }}>Username</th>
              <th style={{ padding: "12px", textAlign: "left", background: "#edf2f7", color: "#4a5568", borderBottom: "2px solid #cbd5e0" }}>PHC</th>
              <th style={{ padding: "12px", textAlign: "left", background: "#edf2f7", color: "#4a5568", borderBottom: "2px solid #cbd5e0" }}>Sub Center</th>
              <th style={{ padding: "12px", textAlign: "right", background: "#edf2f7", color: "#4a5568", borderBottom: "2px solid #cbd5e0" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px", fontWeight: "bold", color: "#2d3748" }}>{u.ashaName}</td>
                <td style={{ padding: "12px", color: "#718096" }}>{u.username}</td>
                <td style={{ padding: "12px", color: "#718096" }}>{u.phc}</td>
                <td style={{ padding: "12px", color: "#718096" }}>{u.sc}</td>
                <td style={{ padding: "12px", textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button onClick={() => navigate(`/admin/user/${u.id}`)} style={{ padding: "6px 12px", background: "#ebf8ff", color: "#3182ce", border: "1px solid #90cdf4", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                    View Grid & Reports
                  </button>
                  <button onClick={() => handleDeleteUser(u.id, u.ashaName)} style={{ padding: "6px 12px", background: "#fff5f5", color: "#c53030", border: "1px solid #feb2b2", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ color: "#2c5282", marginTop: 0, marginBottom: "16px" }}>Create ASHA Profile</h2>
            
            {error && <div style={{ background: "#fff5f5", color: "#c53030", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>{error}</div>}
            
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>Login Username</label>
                  <input required name="username" value={formData.username} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e0" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>Login Password</label>
                  <input required name="password" type="text" value={formData.password} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e0" }} />
                </div>
              </div>

              <div style={{ background: "#f7fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", color: "#4a5568" }}>Permanent Header Info</h3>
                
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "bold" }}>Full Name of ASHA</label>
                  <input required name="ashaName" value={formData.ashaName} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e0" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div><label style={{ fontSize: "13px" }}>PHC</label><input required name="phc" value={formData.phc} onChange={handleChange} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e0" }} /></div>
                  <div><label style={{ fontSize: "13px" }}>Sub Center</label><input required name="sc" value={formData.sc} onChange={handleChange} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e0" }} /></div>
                  <div><label style={{ fontSize: "13px" }}>Village</label><input required name="village" value={formData.village} onChange={handleChange} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e0" }} /></div>
                  <div><label style={{ fontSize: "13px" }}>Taluka</label><input required name="taluka" value={formData.taluka} onChange={handleChange} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e0" }} /></div>
                  <div><label style={{ fontSize: "13px" }}>District</label><input required name="district" value={formData.district} onChange={handleChange} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e0" }} /></div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", background: "white", border: "1px solid #cbd5e0", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: "10px 24px", background: "#3182ce", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: creating ? "not-allowed" : "pointer" }}>
                  {creating ? "Creating..." : "Create ASHA Worker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
