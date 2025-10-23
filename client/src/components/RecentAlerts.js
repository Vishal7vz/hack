import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { apiFetch } from '../utils/api';

const RecentAlerts = ({ socket }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    if (socket) {
      socket.on('securityAlert', (alert) => {
        setAlerts(prev => [alert, ...prev.slice(0, 9)]);
      });
    }
  }, [socket]);

  const fetchAlerts = async () => {
    try {
      const response = await apiFetch('/api/security/alerts');
      const data = await response.json();
      setAlerts(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setLoading(false);
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
        Recent Alerts
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 text-sm">No alerts</div>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.resolved 
                  ? 'bg-slate-700/20 border-slate-600/30 opacity-60' 
                  : getSeverityColor(alert.severity)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">
                      {getSeverityIcon(alert.severity)}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {alert.message}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs text-slate-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                  
                  {alert.details && (
                    <div className="mt-2 text-xs text-slate-300">
                      {typeof alert.details === 'string' 
                        ? alert.details 
                        : JSON.stringify(alert.details, null, 2)
                      }
                    </div>
                  )}
                </div>
                
                {!alert.resolved && (
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="ml-2 p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Total: {alerts.length}</span>
            <span>
              Unresolved: {alerts.filter(a => !a.resolved).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentAlerts;
