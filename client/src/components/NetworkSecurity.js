import React, { useState, useEffect } from 'react';
import { Network, Activity, AlertTriangle, Eye, Ban } from 'lucide-react';

const NetworkSecurity = ({ socket }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [newBlockIP, setNewBlockIP] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchReport();
    fetchBlockedIPs();
    
    if (socket) {
      socket.on('trafficUpdate', (data) => {
        setDashboardData(prev => ({
          ...prev,
          dataTransferred: (prev?.dataTransferred || 0) + data.inbound + data.outbound
        }));
      });

      socket.on('securityAlert', (alert) => {
        if (alert.type === 'suspicious_connection') {
          setDashboardData(prev => ({
            ...prev,
            suspiciousActivities: (prev?.suspiciousActivities || 0) + 1
          }));
        }
      });
    }

    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/security/network/dashboard');
      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await fetch('/api/security/network/report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch network report:', error);
    }
  };

  const fetchBlockedIPs = async () => {
    try {
      const response = await fetch('/api/security/network/blocked-ips');
      const data = await response.json();
      setBlockedIPs(data.blockedIPs || []);
    } catch (error) {
      console.error('Failed to fetch blocked IPs:', error);
    }
  };

  const blockIP = async () => {
    if (!newBlockIP.trim()) return;
    
    try {
      const response = await fetch('/api/security/network/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip: newBlockIP, reason: 'Manual block' })
      });
      
      if (response.ok) {
        setBlockedIPs(prev => [...prev, newBlockIP]);
        setNewBlockIP('');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to block IP:', error);
    }
  };

  const unblockIP = async (ip) => {
    try {
      const response = await fetch('/api/security/network/unblock-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip })
      });
      
      if (response.ok) {
        setBlockedIPs(prev => prev.filter(blockedIP => blockedIP !== ip));
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to unblock IP:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
          <Network className="h-10 w-10 mr-3 text-green-500" />
          Network Security Monitor
        </h1>
        <p className="text-slate-400">
          Real-time network monitoring and threat prevention
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
              <Network className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Connections</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData?.activeConnections || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-red-500/10 rounded-lg mr-4">
              <Ban className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Blocked IPs</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData?.blockedIPs || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500/10 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Suspicious Activities</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData?.suspiciousActivities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/10 rounded-lg mr-4">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Data Transferred</p>
              <p className="text-2xl font-bold text-white">
                {((dashboardData?.dataTransferred || 0) / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Block IP Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Ban className="h-5 w-5 mr-2 text-red-500" />
          IP Management
        </h3>
        
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={newBlockIP}
            onChange={(e) => setNewBlockIP(e.target.value)}
            placeholder="Enter IP address to block"
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={blockIP}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Block IP
          </button>
        </div>

        {/* Blocked IPs List */}
        <div className="space-y-2">
          <h4 className="text-lg font-medium text-white mb-4">Blocked IP Addresses</h4>
          {blockedIPs.length === 0 ? (
            <div className="text-slate-400 text-center py-4">No blocked IPs</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {blockedIPs.map((ip, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <span className="text-white font-mono">{ip}</span>
                  <button
                    onClick={() => unblockIP(ip)}
                    className="text-green-400 hover:text-green-300 text-sm"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Network Report */}
      {report && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-500" />
            Network Security Report
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{report.activeConnections}</div>
              <div className="text-sm text-slate-400">Active Connections</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{report.suspiciousConnections}</div>
              <div className="text-sm text-slate-400">Suspicious</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{report.blockedIPs}</div>
              <div className="text-sm text-slate-400">Blocked IPs</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{report.suspiciousIPs}</div>
              <div className="text-sm text-slate-400">Suspicious IPs</div>
            </div>
          </div>

          {/* Connections List */}
          {report.connections && report.connections.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Active Connections</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {report.connections.map((conn, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        conn.suspicious ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <div className="text-white font-mono text-sm">
                          {conn.remoteAddress}:{conn.remotePort}
                        </div>
                        <div className="text-slate-400 text-xs">
                          Local: {conn.localPort} • Duration: {Math.floor(conn.duration / 1000)}s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{conn.state}</div>
                      {conn.suspicious && (
                        <div className="text-xs text-yellow-400">Suspicious</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkSecurity;
