import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const SecurityOverview = ({ overview }) => {
  if (!overview) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const modules = [
    {
      name: 'Threat Detection',
      data: overview.threatDetection,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      name: 'Secure Sharing',
      data: overview.secureSharing,
      icon: Shield,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      name: 'Web3 Identity',
      data: overview.web3Identity,
      icon: Shield,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      name: 'Network Security',
      data: overview.networkSecurity,
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-blue-500" />
        Security Overview
      </h3>
      
      <div className="space-y-4">
        {modules.map((module, index) => {
          const Icon = module.icon;
          const isActive = module.data?.isActive;
          
          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${module.bgColor} mr-4`}>
                  <Icon className={`h-5 w-5 ${module.color}`} />
                </div>
                <div>
                  <h4 className="font-medium text-white">{module.name}</h4>
                  <p className="text-sm text-slate-400">
                    {isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                {isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h5 className="text-sm font-medium text-slate-400 mb-2">Total Patterns</h5>
          <p className="text-2xl font-bold text-white">
            {overview.threatDetection?.patternsLoaded || 0}
          </p>
        </div>
        
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h5 className="text-sm font-medium text-slate-400 mb-2">Active Sessions</h5>
          <p className="text-2xl font-bold text-white">
            {overview.secureSharing?.activeSessions || 0}
          </p>
        </div>
        
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h5 className="text-sm font-medium text-slate-400 mb-2">Identities</h5>
          <p className="text-2xl font-bold text-white">
            {overview.web3Identity?.totalIdentities || 0}
          </p>
        </div>
        
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h5 className="text-sm font-medium text-slate-400 mb-2">Blocked IPs</h5>
          <p className="text-2xl font-bold text-white">
            {overview.networkSecurity?.blockedIPs || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityOverview;
