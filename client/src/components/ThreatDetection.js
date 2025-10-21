import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, Zap, Activity } from 'lucide-react';

const ThreatDetection = ({ socket }) => {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testRequest, setTestRequest] = useState({
    url: '',
    method: 'GET',
    body: ''
  });

  useEffect(() => {
    fetchStats();
    
    if (socket) {
      socket.on('threatAlert', (threat) => {
        setThreats(prev => [threat, ...prev.slice(0, 19)]);
      });
    }
  }, [socket]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/security/threats/stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch threat stats:', error);
      setLoading(false);
    }
  };

  const analyzeRequest = async () => {
    try {
      const response = await fetch('/api/security/threats/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ request: testRequest })
      });
      
      const data = await response.json();
      if (data.threats.length > 0) {
        setThreats(prev => [...data.threats, ...prev.slice(0, 19)]);
      }
    } catch (error) {
      console.error('Failed to analyze request:', error);
    }
  };

  const getThreatTypeColor = (type) => {
    switch (type) {
      case 'sql_injection':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'xss':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'path_traversal':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'command_injection':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
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
          <Shield className="h-10 w-10 mr-3 text-red-500" />
          AI-Powered Threat Detection
        </h1>
        <p className="text-slate-400">
          Real-time analysis and protection against security threats
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-red-500/10 rounded-lg mr-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Patterns Loaded</p>
              <p className="text-2xl font-bold text-white">
                {stats?.patternsLoaded || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">System Status</p>
              <p className="text-2xl font-bold text-white">
                {stats?.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/10 rounded-lg mr-4">
              <Zap className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Anomaly Threshold</p>
              <p className="text-2xl font-bold text-white">
                {(stats?.anomalyThreshold * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Request Analyzer */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Eye className="h-5 w-5 mr-2 text-blue-500" />
          Request Analyzer
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL
              </label>
              <input
                type="text"
                value={testRequest.url}
                onChange={(e) => setTestRequest({...testRequest, url: e.target.value})}
                placeholder="https://example.com/api/users?id=1"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Method
              </label>
              <select
                value={testRequest.method}
                onChange={(e) => setTestRequest({...testRequest, method: e.target.value})}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Request Body
            </label>
            <textarea
              value={testRequest.body}
              onChange={(e) => setTestRequest({...testRequest, body: e.target.value})}
              placeholder='{"username": "admin", "password": "password"}'
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={analyzeRequest}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Analyze Request
          </button>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Recent Threat Detections
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {threats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400">No threats detected recently</div>
            </div>
          ) : (
            threats.map((threat, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  threat.type === 'pattern_match' 
                    ? getThreatTypeColor(threat.threats[0]?.type)
                    : 'text-blue-400 bg-blue-500/20 border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">⚠️</span>
                      <span className="font-medium text-white">
                        {threat.type === 'pattern_match' 
                          ? `Pattern Match: ${threat.threats[0]?.type?.toUpperCase()}`
                          : `Anomaly Detected: ${threat.type}`
                        }
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-300 mb-2">
                      {threat.request && (
                        <div>
                          <strong>URL:</strong> {threat.request.url}<br/>
                          <strong>Method:</strong> {threat.request.method}<br/>
                          <strong>IP:</strong> {threat.request.ip}
                        </div>
                      )}
                      {threat.details && (
                        <div>
                          <strong>Details:</strong> {threat.details}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-400">
                      {new Date(threat.timestamp).toLocaleString()}
                    </div>
                    
                    {threat.recommendations && threat.recommendations.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-slate-300 mb-1">
                          Recommendations:
                        </div>
                        <ul className="text-xs text-slate-400 list-disc list-inside">
                          {threat.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatDetection;
