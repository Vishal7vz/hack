import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut,
  Home,
  AlertTriangle,
  Lock,
  Users,
  Network,
  Key
} from 'lucide-react';

const Navbar = ({ user, onLogout, alerts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Threat Detection', href: '/threats', icon: AlertTriangle },
    { name: 'Secure Sharing', href: '/sharing', icon: Lock },
    { name: 'Web3 Identity', href: '/identity', icon: Users },
    { name: 'Network Security', href: '/network', icon: Network },
    { name: 'Password Generator', href: '/passwords', icon: Key }
  ];

  const unreadAlerts = alerts.filter(alert => !alert.resolved).length;

  return (
    <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">
                  SecureShield
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-300 hover:text-white hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Alerts */}
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="bg-slate-700/50 p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-600/50 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadAlerts}
                  </span>
                )}
              </button>

              {/* Alerts Dropdown */}
              {showAlerts && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Security Alerts</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-slate-400 text-center">
                        No alerts
                      </div>
                    ) : (
                      alerts.slice(0, 5).map((alert, index) => (
                        <div
                          key={index}
                          className={`p-4 border-b border-slate-700 last:border-b-0 ${
                            alert.resolved ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                              alert.severity === 'high' ? 'bg-red-500' :
                              alert.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {alert.message}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-slate-700/50 p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-600/50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-slate-800/50 backdrop-blur-sm">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border-r-2 border-blue-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile user info */}
          <div className="pt-4 pb-3 border-t border-slate-700">
            <div className="flex items-center px-3">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-slate-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user?.username}</div>
                <div className="text-sm text-slate-400">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-3">
              <button
                onClick={onLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
