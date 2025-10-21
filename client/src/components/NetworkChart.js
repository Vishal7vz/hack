import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Network, Activity } from 'lucide-react';

const NetworkChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateMockData();
    const interval = setInterval(updateData, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateMockData = () => {
    const now = new Date();
    const mockData = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseConnections = 50 + Math.sin(i * 0.5) * 20;
      const baseBandwidth = 100 + Math.sin(i * 0.3) * 30;
      
      mockData.push({
        time: time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        connections: Math.floor(baseConnections + Math.random() * 20),
        bandwidth: Math.floor(baseBandwidth + Math.random() * 40),
        latency: Math.floor(20 + Math.random() * 30),
        errors: Math.floor(Math.random() * 5)
      });
    }
    
    setData(mockData);
    setLoading(false);
  };

  const updateData = () => {
    setData(prev => {
      const newData = [...prev];
      const lastData = newData[newData.length - 1];
      
      newData.push({
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        connections: Math.max(0, lastData.connections + (Math.random() - 0.5) * 10),
        bandwidth: Math.max(0, lastData.bandwidth + (Math.random() - 0.5) * 20),
        latency: Math.max(10, lastData.latency + (Math.random() - 0.5) * 10),
        errors: Math.floor(Math.random() * 5)
      });
      
      return newData.slice(-24); // Keep last 24 data points
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const avgConnections = Math.round(data.reduce((sum, item) => sum + item.connections, 0) / data.length);
  const avgBandwidth = Math.round(data.reduce((sum, item) => sum + item.bandwidth, 0) / data.length);
  const avgLatency = Math.round(data.reduce((sum, item) => sum + item.latency, 0) / data.length);
  const totalErrors = data.reduce((sum, item) => sum + item.errors, 0);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Network className="h-5 w-5 mr-2 text-blue-500" />
          Network Performance
        </h3>
        <div className="flex items-center text-sm text-slate-400">
          <Activity className="h-4 w-4 mr-1" />
          Real-time
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-400">{avgConnections}</div>
          <div className="text-xs text-slate-400">Avg Connections</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-400">{avgBandwidth} MB/s</div>
          <div className="text-xs text-slate-400">Avg Bandwidth</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-400">{avgLatency}ms</div>
          <div className="text-xs text-slate-400">Avg Latency</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-400">{totalErrors}</div>
          <div className="text-xs text-slate-400">Total Errors</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="connectionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="bandwidthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Area
              type="monotone"
              dataKey="connections"
              stroke="#3B82F6"
              fill="url(#connectionsGradient)"
              strokeWidth={2}
              name="Connections"
            />
            <Area
              type="monotone"
              dataKey="bandwidth"
              stroke="#10B981"
              fill="url(#bandwidthGradient)"
              strokeWidth={2}
              name="Bandwidth (MB/s)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-slate-400">Active Connections</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-slate-400">Bandwidth Usage</span>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className={`text-sm font-medium ${
            avgLatency < 50 ? 'text-green-400' : 
            avgLatency < 100 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {avgLatency < 50 ? 'Excellent' : 
             avgLatency < 100 ? 'Good' : 'Poor'}
          </div>
          <div className="text-xs text-slate-400">Latency</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-medium ${
            totalErrors < 10 ? 'text-green-400' : 
            totalErrors < 25 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {totalErrors < 10 ? 'Stable' : 
             totalErrors < 25 ? 'Warning' : 'Critical'}
          </div>
          <div className="text-xs text-slate-400">Error Rate</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-medium ${
            avgBandwidth > 80 ? 'text-green-400' : 
            avgBandwidth > 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {avgBandwidth > 80 ? 'High' : 
             avgBandwidth > 50 ? 'Medium' : 'Low'}
          </div>
          <div className="text-xs text-slate-400">Throughput</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkChart;
