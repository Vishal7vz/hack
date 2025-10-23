import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
// import Login from './components/Login';
// import Register from './components/Register';
import ThreatDetection from './components/ThreatDetection';
import SecureSharing from './components/SecureSharing';
import Web3Identity from './components/Web3Identity';
import NetworkSecurity from './components/NetworkSecurity';
import PasswordGenerator from './components/PasswordGenerator';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [user] = useState({ username: 'Guest', email: 'guest@secureshield.com' });
  const [socket, setSocket] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const useEdgeWS = process.env.REACT_APP_EDGE_WS === '1';
    if (typeof window === 'undefined') return;
    if (useEdgeWS) {
      const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${wsProto}://${window.location.host}/api/ws?channel=security`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'message' && msg.payload) {
            const payload = msg.payload;
            if (payload.type === 'securityAlert') {
              setAlerts(prev => [payload.data, ...prev.slice(0, 9)]);
            } else if (payload.type === 'threatAlert') {
              const threat = payload.data || {};
              setAlerts(prev => [{
                type: 'threat_detected',
                severity: 'high',
                message: `Threat detected: ${threat.type}`,
                details: threat,
                timestamp: new Date().toISOString()
              }, ...prev.slice(0, 9)]);
            }
          }
        } catch {}
      };

      return () => {
        try { ws.close(); } catch {}
      };
    } else {
      // Initialize socket.io connection (same-origin in prod, localhost in dev)
      const apiUrl = process.env.REACT_APP_API_URL || window.location.origin || 'http://localhost:5000';
      const newSocket = io(apiUrl);
      setSocket(newSocket);

      // Listen for security alerts
      newSocket.on('securityAlert', (alert) => {
        setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      });

      newSocket.on('threatAlert', (threat) => {
        setAlerts(prev => [{
          type: 'threat_detected',
          severity: 'high',
          message: `Threat detected: ${threat.type}`,
          details: threat,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)]);
      });

      return () => {
        newSocket.close();
      };
    }
  }, []);

  const handleLogout = () => {
    // Logout functionality (optional)
    console.log('Logout clicked');
  };

  return (
    <Router>
      <div className="global-grid-bg">
        <div className="min-h-screen bg-slate-900">
          <Navbar user={user} onLogout={handleLogout} alerts={alerts} />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard socket={socket} />} />
              <Route path="/threats" element={<ThreatDetection socket={socket} />} />
              <Route path="/sharing" element={<SecureSharing />} />
              <Route path="/identity" element={<Web3Identity />} />
              <Route path="/network" element={<NetworkSecurity socket={socket} />} />
              <Route path="/passwords" element={<PasswordGenerator />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
