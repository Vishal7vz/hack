import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const ThreatChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateMockData();
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateMockData = () => {
    const now = new Date();
    const mockData = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      mockData.push({
        time: time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        threats: Math.floor(Math.random() * 20) + 5,
        blocked: Math.floor(Math.random() * 15) + 3,
        suspicious: Math.floor(Math.random() * 10) + 2
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
        threats: Math.floor(Math.random() * 20) + 5,
        blocked: Math.floor(Math.random() * 15) + 3,
        suspicious: Math.floor(Math.random() * 10) + 2
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

  const totalThreats = data.reduce((sum, item) => sum + item.threats, 0);
  const totalBlocked = data.reduce((sum, item) => sum + item.blocked, 0);
  const blockedPercentage = totalThreats > 0 ? ((totalBlocked / totalThreats) * 100).toFixed(1) : 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Threat Detection Trends
        </h3>
        <div className="flex items-center text-sm text-slate-400">
          <TrendingUp className="h-4 w-4 mr-1" />
          Last 24 Hours
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-400">{totalThreats}</div>
          <div className="text-xs text-slate-400">Total Threats</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-400">{totalBlocked}</div>
          <div className="text-xs text-slate-400">Blocked</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-400">{blockedPercentage}%</div>
          <div className="text-xs text-slate-400">Block Rate</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
            <Line
              type="monotone"
              dataKey="threats"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              name="Threats Detected"
            />
            <Line
              type="monotone"
              dataKey="blocked"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="Threats Blocked"
            />
            <Line
              type="monotone"
              dataKey="suspicious"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              name="Suspicious Activities"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm text-slate-400">Threats Detected</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-slate-400">Blocked</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-slate-400">Suspicious</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatChart;
