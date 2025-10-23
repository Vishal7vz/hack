import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Network, 
  Lock, 
  Activity,
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react';
import SecurityOverview from './SecurityOverview';
import ThreatChart from './ThreatChart';
import NetworkChart from './NetworkChart';
import RecentAlerts from './RecentAlerts';
import { apiFetch } from '../utils/api';

const Dashboard = ({ socket }) => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState({
    activeConnections: 0,
    threatsBlocked: 0,
    dataTransferred: 0,
    systemHealth: 95
  });

  useEffect(() => {
    fetchOverview();
    
    // Listen for real-time updates
    if (socket) {
      socket.on('trafficUpdate', (data) => {
        setRealTimeData(prev => ({
          ...prev,
          dataTransferred: prev.dataTransferred + data.inbound + data.outbound
        }));
      });

      socket.on('threatAlert', () => {
        setRealTimeData(prev => ({
          ...prev,
          threatsBlocked: prev.threatsBlocked + 1
        }));
      });
    }

    // Update data every 5 seconds
    const interval = setInterval(fetchOverview, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [socket]);

  const fetchOverview = async () => {
    try {
      const response = await apiFetch('/api/security/overview');
      const data = await response.json();
      setOverview(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch overview:', error);
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Active Connections',
      value: realTimeData.activeConnections,
      icon: Network,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+12%'
    },
    {
      title: 'Threats Blocked',
      value: realTimeData.threatsBlocked,
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+5%'
    },
    {
      title: 'Data Transferred',
      value: `${(realTimeData.dataTransferred / 1024 / 1024).toFixed(1)} MB`,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+8%'
    },
    {
      title: 'System Health',
      value: `${realTimeData.systemHealth}%`,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      change: '+2%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          SecureShield Dashboard
        </h1>
        <p className="text-slate-400">
          Multi-Layer Security Intelligence Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 card-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-green-400 text-sm mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Overview */}
        <div className="lg:col-span-2">
          <SecurityOverview overview={overview} />
        </div>

        {/* Recent Alerts */}
        <div>
          <RecentAlerts socket={socket} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ThreatChart />
        <NetworkChart />
      </div>

      {/* Security Modules Status */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Security Modules Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overview && Object.entries(overview).filter(([key]) => key !== 'timestamp').map(([module, data]) => (
            <div key={module} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <h4 className="font-medium text-white capitalize">
                  {module.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-sm text-slate-400">
                  {data.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                data.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Eye className="h-5 w-5 mr-2 text-blue-500" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30 transition-colors">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            <span className="text-red-400 font-medium">Block Suspicious IP</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-colors">
            <Lock className="h-5 w-5 mr-2 text-blue-500" />
            <span className="text-blue-400 font-medium">Create Secure Session</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500/30 transition-colors">
            <Users className="h-5 w-5 mr-2 text-green-500" />
            <span className="text-green-400 font-medium">Verify Identity</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
