import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, Shield, Lock, Key, History, BarChart3 } from 'lucide-react';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [entropy, setEntropy] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  
  // Password generation options
  const [options, setOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
    excludeAmbiguous: true,
    customSymbols: '',
    excludeCharacters: ''
  });

  // Password type selection
  const [passwordType, setPasswordType] = useState('secure'); // secure, memorable, requirements

  // Memorable password options
  const [memorableOptions, setMemorableOptions] = useState({
    wordCount: 4,
    separator: '-',
    includeNumbers: true
  });

  // Requirements for complex passwords
  const [requirements, setRequirements] = useState({
    minLength: 12,
    maxLength: 32,
    minUppercase: 2,
    minLowercase: 2,
    minNumbers: 2,
    minSymbols: 2,
    maxConsecutive: 2
  });

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/security/passwords/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load password history:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/security/passwords/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Failed to load password stats:', error);
    }
  };

  const generatePassword = async () => {
    setIsGenerating(true);
    try {
      let response;
      
      if (passwordType === 'memorable') {
        response = await fetch('/api/security/passwords/generate-memorable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memorableOptions)
        });
      } else if (passwordType === 'requirements') {
        response = await fetch('/api/security/passwords/generate-requirements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requirements)
        });
      } else {
        response = await fetch('/api/security/passwords/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options)
        });
      }

      if (response.ok) {
        const data = await response.json();
        setPassword(data.password);
        setStrength(data.strength);
        setEntropy(data.entropy);
        loadHistory(); // Refresh history
        loadStats(); // Refresh stats
      } else {
        console.error('Failed to generate password');
      }
    } catch (error) {
      console.error('Error generating password:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy password:', error);
      }
    }
  };

  const getStrengthColor = (strength) => {
    if (strength < 30) return 'text-red-500 bg-red-100';
    if (strength < 60) return 'text-yellow-500 bg-yellow-100';
    if (strength < 80) return 'text-orange-500 bg-orange-100';
    return 'text-green-500 bg-green-100';
  };

  const getStrengthLabel = (strength) => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  const getEntropyLevel = (entropy) => {
    if (entropy < 30) return 'Low';
    if (entropy < 50) return 'Medium';
    if (entropy < 70) return 'High';
    return 'Very High';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Key className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Password Generator</h3>
          <p className="text-gray-400">Generate secure, customizable passwords</p>
        </div>
      </div>

      {/* Password Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Password Type</label>
        <div className="flex gap-2">
          {[
            { value: 'secure', label: 'Secure', icon: Shield },
            { value: 'memorable', label: 'Memorable', icon: Lock },
            { value: 'requirements', label: 'Requirements', icon: BarChart3 }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setPasswordType(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                passwordType === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Password Display */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              readOnly
              className="w-full bg-transparent text-white text-lg font-mono p-2 border border-gray-600 rounded"
              placeholder="Generated password will appear here..."
            />
          </div>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!password}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>

        {password && (
          <div className="flex items-center gap-4 text-sm">
            <div className={`px-3 py-1 rounded-full ${getStrengthColor(strength)}`}>
              {getStrengthLabel(strength)} ({strength}%)
            </div>
            <div className="text-gray-400">
              Entropy: {entropy.toFixed(1)} bits ({getEntropyLevel(entropy)})
            </div>
            <div className="text-gray-400">
              Length: {password.length} characters
            </div>
          </div>
        )}
      </div>

      {/* Generation Options */}
      {passwordType === 'secure' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password Length: {options.length}
            </label>
            <input
              type="range"
              min="8"
              max="128"
              value={options.length}
              onChange={(e) => setOptions({...options, length: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={options.includeUppercase}
                onChange={(e) => setOptions({...options, includeUppercase: e.target.checked})}
                className="rounded"
              />
              Uppercase (A-Z)
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={options.includeLowercase}
                onChange={(e) => setOptions({...options, includeLowercase: e.target.checked})}
                className="rounded"
              />
              Lowercase (a-z)
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => setOptions({...options, includeNumbers: e.target.checked})}
                className="rounded"
              />
              Numbers (0-9)
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={options.includeSymbols}
                onChange={(e) => setOptions({...options, includeSymbols: e.target.checked})}
                className="rounded"
              />
              Symbols (!@#$)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={options.excludeSimilar}
                onChange={(e) => setOptions({...options, excludeSimilar: e.target.checked})}
                className="rounded"
              />
              Exclude Similar (il1Lo0O)
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(e) => setOptions({...options, excludeAmbiguous: e.target.checked})}
                className="rounded"
              />
              Exclude Ambiguous ({ }[ ]( )/\~)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Symbols (optional)
            </label>
            <input
              type="text"
              value={options.customSymbols}
              onChange={(e) => setOptions({...options, customSymbols: e.target.value})}
              placeholder="!@#$%^&*"
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Exclude Characters (optional)
            </label>
            <input
              type="text"
              value={options.excludeCharacters}
              onChange={(e) => setOptions({...options, excludeCharacters: e.target.value})}
              placeholder="Characters to exclude"
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"
            />
          </div>
        </div>
      )}

      {/* Memorable Password Options */}
      {passwordType === 'memorable' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Word Count: {memorableOptions.wordCount}
            </label>
            <input
              type="range"
              min="3"
              max="8"
              value={memorableOptions.wordCount}
              onChange={(e) => setMemorableOptions({...memorableOptions, wordCount: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Separator</label>
            <select
              value={memorableOptions.separator}
              onChange={(e) => setMemorableOptions({...memorableOptions, separator: e.target.value})}
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"
            >
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
              <option value="">None</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={memorableOptions.includeNumbers}
              onChange={(e) => setMemorableOptions({...memorableOptions, includeNumbers: e.target.checked})}
              className="rounded"
            />
            Include Numbers
          </label>
        </div>
      )}

      {/* Requirements Options */}
      {passwordType === 'requirements' && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Length: {requirements.minLength}
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={requirements.minLength}
                onChange={(e) => setRequirements({...requirements, minLength: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Length: {requirements.maxLength}
              </label>
              <input
                type="range"
                min="12"
                max="128"
                value={requirements.maxLength}
                onChange={(e) => setRequirements({...requirements, maxLength: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Uppercase: {requirements.minUppercase}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={requirements.minUppercase}
                onChange={(e) => setRequirements({...requirements, minUppercase: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Lowercase: {requirements.minLowercase}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={requirements.minLowercase}
                onChange={(e) => setRequirements({...requirements, minLowercase: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Numbers: {requirements.minNumbers}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={requirements.minNumbers}
                onChange={(e) => setRequirements({...requirements, minNumbers: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Symbols: {requirements.minSymbols}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={requirements.minSymbols}
                onChange={(e) => setRequirements({...requirements, minSymbols: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Consecutive: {requirements.maxConsecutive}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={requirements.maxConsecutive}
              onChange={(e) => setRequirements({...requirements, maxConsecutive: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={generatePassword}
        disabled={isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Key className="w-5 h-5" />
        )}
        {isGenerating ? 'Generating...' : 'Generate Password'}
      </button>

      {/* Statistics */}
      {Object.keys(stats).length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Generated:</span>
              <span className="text-white ml-2">{stats.totalGenerated}</span>
            </div>
            <div>
              <span className="text-gray-400">Avg Strength:</span>
              <span className="text-white ml-2">{stats.averageStrength?.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Avg Entropy:</span>
              <span className="text-white ml-2">{stats.averageEntropy?.toFixed(1)} bits</span>
            </div>
            <div>
              <span className="text-gray-400">Common Length:</span>
              <span className="text-white ml-2">{stats.mostCommonLength} chars</span>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Passwords
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {history.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-300">
                    {entry.password.length > 20 ? entry.password.substring(0, 20) + '...' : entry.password}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getStrengthColor(entry.strength)}`}>
                    {entry.strength}%
                  </span>
                </div>
                <button
                  onClick={() => {
                    setPassword(entry.password);
                    setStrength(entry.strength);
                    setEntropy(entry.entropy || 0);
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
