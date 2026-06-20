import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(username, password);
      navigate('/'); // redirect to the dashboard/form
    } catch (err) {
      console.error(err);
      setError('Failed to log in. Please check your username and password.');
    }
    setLoading(false);
  }

  return (
    <div style={{
      maxWidth: "400px",
      margin: "100px auto",
      padding: "32px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ color: "#2c5282", marginBottom: "8px", textAlign: "center" }}>ASHA Portal Login</h1>
      <p style={{ color: "#666", marginBottom: "24px", textAlign: "center" }}>Please sign in to continue</p>
      
      {error && <div style={{ background: "#fed7d7", color: "#c53030", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#4a5568" }}>Username (ASHA ID)</label>
          <input 
            type="text" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#4a5568" }}>Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", boxSizing: "border-box" }}
          />
        </div>
        <button 
          disabled={loading}
          type="submit" 
          style={{ 
            padding: "12px", 
            background: "#3182ce", 
            color: "white", 
            border: "none", 
            borderRadius: "6px", 
            fontWeight: "bold", 
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "8px"
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
