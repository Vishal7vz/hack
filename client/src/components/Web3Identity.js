import React, { useState, useEffect } from 'react';
import { Users, Shield, Key, CheckCircle, XCircle } from 'lucide-react';

const Web3Identity = () => {
  const [stats, setStats] = useState(null);
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIdentity, setNewIdentity] = useState({
    name: '',
    email: '',
    organization: ''
  });

  useEffect(() => {
    fetchStats();
    fetchIdentities();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/security/identity/stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch identity stats:', error);
      setLoading(false);
    }
  };

  const fetchIdentities = async () => {
    try {
      const response = await fetch('/api/security/identity');
      const data = await response.json();
      setIdentities(data);
    } catch (error) {
      console.error('Failed to fetch identities:', error);
    }
  };

  const createIdentity = async () => {
    try {
      const response = await fetch('/api/security/identity/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userData: newIdentity })
      });
      
      const data = await response.json();
      if (response.ok) {
        setIdentities(prev => [data, ...prev]);
        setShowCreateForm(false);
        setNewIdentity({ name: '', email: '', organization: '' });
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to create identity:', error);
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
          <Users className="h-10 w-10 mr-3 text-purple-500" />
          Web3 Identity Verification
        </h1>
        <p className="text-slate-400">
          Decentralized identity management with blockchain verification
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/10 rounded-lg mr-4">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Identities</p>
              <p className="text-2xl font-bold text-white">
                {stats?.totalIdentities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/10 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Verified</p>
              <p className="text-2xl font-bold text-white">
                {stats?.verifiedIdentities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
              <Key className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Credentials</p>
              <p className="text-2xl font-bold text-white">
                {stats?.totalCredentials || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-red-500/10 rounded-lg mr-4">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Revoked</p>
              <p className="text-2xl font-bold text-white">
                {stats?.revokedIdentities || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Identity Button */}
      <div className="text-center">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Create New Identity
        </button>
      </div>

      {/* Create Identity Form */}
      {showCreateForm && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Create Web3 Identity</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newIdentity.name}
                  onChange={(e) => setNewIdentity({...newIdentity, name: e.target.value})}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newIdentity.email}
                  onChange={(e) => setNewIdentity({...newIdentity, email: e.target.value})}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Organization
              </label>
              <input
                type="text"
                value={newIdentity.organization}
                onChange={(e) => setNewIdentity({...newIdentity, organization: e.target.value})}
                placeholder="Enter your organization"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createIdentity}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Create Identity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Identities List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-500" />
          Digital Identities
        </h3>
        
        <div className="space-y-4">
          {identities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400">No identities created yet</div>
            </div>
          ) : (
            identities.map((identity, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-500/10 rounded-lg mr-4">
                      <Shield className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
                        {identity.address?.slice(0, 10)}...{identity.address?.slice(-6)}
                      </h4>
                      <p className="text-sm text-slate-400">
                        Created: {new Date(identity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      identity.verified 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {identity.verified ? 'Verified' : 'Pending'}
                    </span>
                    {identity.revoked && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Revoked
                      </span>
                    )}
                    <button className="text-purple-400 hover:text-purple-300 text-sm">
                      View Details
                    </button>
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

export default Web3Identity;
