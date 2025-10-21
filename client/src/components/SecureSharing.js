import React, { useState, useEffect } from 'react';
import { Lock, Users, Share2, Eye, EyeOff } from 'lucide-react';

const SecureSharing = () => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    participants: [{ id: '', permissions: 'read' }],
    data: '',
    password: '',
    expiresIn: 24
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/security/sharing/stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch sharing stats:', error);
      setLoading(false);
    }
  };

  const createSession = async () => {
    try {
      const response = await fetch('/api/security/sharing/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants: newSession.participants,
          data: { content: newSession.data },
          options: {
            password: newSession.password,
            expiresAt: new Date(Date.now() + newSession.expiresIn * 60 * 60 * 1000).toISOString()
          }
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSessions(prev => [data, ...prev]);
        setShowCreateForm(false);
        setNewSession({
          participants: [{ id: '', permissions: 'read' }],
          data: '',
          password: '',
          expiresIn: 24
        });
      }
    } catch (error) {
      console.error('Failed to create session:', error);
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
          <Lock className="h-10 w-10 mr-3 text-blue-500" />
          Secure Data Sharing
        </h1>
        <p className="text-slate-400">
          Encrypted data sharing with access control and audit trails
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/10 rounded-lg mr-4">
              <Share2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Sessions</p>
              <p className="text-2xl font-bold text-white">
                {stats?.activeSessions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/10 rounded-lg mr-4">
              <Lock className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Encryption</p>
              <p className="text-2xl font-bold text-white">
                {stats?.encryptionAlgorithm || 'AES-256-GCM'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/10 rounded-lg mr-4">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Key Iterations</p>
              <p className="text-2xl font-bold text-white">
                {stats?.keyDerivationIterations?.toLocaleString() || '100,000'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Button */}
      <div className="text-center">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Create New Sharing Session
        </button>
      </div>

      {/* Create Session Form */}
      {showCreateForm && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Create Sharing Session</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Data to Share
              </label>
              <textarea
                value={newSession.data}
                onChange={(e) => setNewSession({...newSession, data: e.target.value})}
                placeholder="Enter the data you want to share securely..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password (optional)
                </label>
                <input
                  type="password"
                  value={newSession.password}
                  onChange={(e) => setNewSession({...newSession, password: e.target.value})}
                  placeholder="Leave empty for auto-generated"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Expires In (hours)
                </label>
                <input
                  type="number"
                  value={newSession.expiresIn}
                  onChange={(e) => setNewSession({...newSession, expiresIn: parseInt(e.target.value)})}
                  min="1"
                  max="168"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSession}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Share2 className="h-5 w-5 mr-2 text-blue-500" />
          Sharing Sessions
        </h3>
        
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400">No active sessions</div>
            </div>
          ) : (
            sessions.map((session, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Session {session.sessionId?.slice(0, 8)}...</h4>
                    <p className="text-sm text-slate-400">
                      Expires: {new Date(session.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Active
                    </span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
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

export default SecureSharing;
