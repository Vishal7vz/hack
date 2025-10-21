const EventEmitter = require('events');
const os = require('os');
const net = require('net');
const dns = require('dns').promises;

class NetworkSecurityMonitor extends EventEmitter {
  constructor() {
    super();
    this.isActive = false;
    this.monitoringInterval = null;
    this.connections = new Map();
    this.suspiciousIPs = new Set();
    this.blockedIPs = new Set();
    this.networkStats = {
      totalConnections: 0,
      activeConnections: 0,
      blockedAttempts: 0,
      suspiciousActivities: 0,
      dataTransferred: 0
    };
    this.io = null;
  }

  initialize(io) {
    this.io = io;
    this.isActive = true;
    console.log('✅ Network Security Monitor initialized');
    
    // Start monitoring
    this.startMonitoring();
    
    // Initialize threat detection patterns
    this.initializeThreatPatterns();
  }

  initializeThreatPatterns() {
    // Common suspicious IP patterns and known malicious IPs
    this.suspiciousPatterns = [
      /^10\.0\.0\./,  // Private network scanning
      /^192\.168\./,  // Local network scanning
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private network scanning
      /^127\.0\.0\.1$/,  // Localhost (potentially suspicious in some contexts)
    ];

    // Known malicious IP ranges (example - in production, use threat intelligence feeds)
    this.maliciousRanges = [
      '185.220.101.',  // Example malicious range
      '45.146.164.',   // Example malicious range
    ];
  }

  startMonitoring() {
    // Monitor network connections every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.scanNetworkConnections();
      this.analyzeNetworkTraffic();
      this.checkForAnomalies();
    }, 5000);

    // Monitor system resources every 30 seconds
    setInterval(() => {
      this.monitorSystemResources();
    }, 30000);

    console.log('🔍 Network monitoring started');
  }

  async scanNetworkConnections() {
    try {
      const connections = await this.getActiveConnections();
      
      for (const connection of connections) {
        const connectionId = `${connection.localAddress}:${connection.localPort}-${connection.remoteAddress}:${connection.remotePort}`;
        
        if (!this.connections.has(connectionId)) {
          // New connection detected
          this.connections.set(connectionId, {
            ...connection,
            startTime: new Date(),
            dataTransferred: 0,
            suspicious: false
          });

          this.emit('newConnection', {
            connectionId,
            remoteAddress: connection.remoteAddress,
            localPort: connection.localPort,
            timestamp: new Date().toISOString()
          });

          // Check if connection is suspicious
          await this.analyzeConnection(connectionId, connection);
        }
      }

      // Remove closed connections
      const currentConnections = new Set(connections.map(c => 
        `${c.localAddress}:${c.localPort}-${c.remoteAddress}:${c.remotePort}`
      ));
      
      for (const [connectionId, connection] of this.connections) {
        if (!currentConnections.has(connectionId)) {
          this.connections.delete(connectionId);
          this.emit('connectionClosed', {
            connectionId,
            duration: Date.now() - connection.startTime.getTime(),
            timestamp: new Date().toISOString()
          });
        }
      }

      this.networkStats.activeConnections = this.connections.size;
      this.networkStats.totalConnections++;

    } catch (error) {
      console.error('Error scanning network connections:', error);
    }
  }

  async getActiveConnections() {
    // In a real implementation, this would use system APIs to get actual connections
    // For demo purposes, we'll simulate some connections
    const mockConnections = [
      {
        localAddress: '127.0.0.1',
        localPort: 3000,
        remoteAddress: '192.168.1.100',
        remotePort: 45678,
        state: 'ESTABLISHED',
        pid: 1234
      },
      {
        localAddress: '0.0.0.0',
        localPort: 80,
        remoteAddress: '10.0.0.50',
        remotePort: 12345,
        state: 'ESTABLISHED',
        pid: 5678
      }
    ];

    return mockConnections;
  }

  async analyzeConnection(connectionId, connection) {
    const isSuspicious = await this.isSuspiciousConnection(connection);
    
    if (isSuspicious) {
      this.connections.get(connectionId).suspicious = true;
      this.suspiciousIPs.add(connection.remoteAddress);
      
      this.emit('suspiciousConnection', {
        connectionId,
        remoteAddress: connection.remoteAddress,
        reason: isSuspicious.reason,
        timestamp: new Date().toISOString()
      });

      // Send real-time alert
      if (this.io) {
        this.io.emit('securityAlert', {
          type: 'suspicious_connection',
          severity: 'medium',
          message: `Suspicious connection detected from ${connection.remoteAddress}`,
          details: isSuspicious,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async isSuspiciousConnection(connection) {
    const { remoteAddress, localPort, state } = connection;

    // Check against known malicious IPs
    for (const range of this.maliciousRanges) {
      if (remoteAddress.startsWith(range)) {
        return {
          reason: 'Known malicious IP range',
          confidence: 0.9,
          action: 'block'
        };
      }
    }

    // Check for port scanning patterns
    if (this.isPortScanning(remoteAddress)) {
      return {
        reason: 'Port scanning detected',
        confidence: 0.8,
        action: 'monitor'
      };
    }

    // Check for suspicious port combinations
    if (this.isSuspiciousPortCombo(localPort, remoteAddress)) {
      return {
        reason: 'Suspicious port combination',
        confidence: 0.6,
        action: 'monitor'
      };
    }

    // Check for rapid connection attempts
    if (this.isRapidConnection(remoteAddress)) {
      return {
        reason: 'Rapid connection attempts',
        confidence: 0.7,
        action: 'rate_limit'
      };
    }

    return false;
  }

  isPortScanning(ip) {
    // Check if IP is attempting to connect to multiple ports
    const connectionsFromIP = Array.from(this.connections.values())
      .filter(conn => conn.remoteAddress === ip);
    
    const uniquePorts = new Set(connectionsFromIP.map(conn => conn.localPort));
    return uniquePorts.size > 5; // More than 5 different ports
  }

  isSuspiciousPortCombo(localPort, remoteAddress) {
    // Check for suspicious port combinations
    const suspiciousPorts = [22, 23, 135, 139, 445, 1433, 3389]; // SSH, Telnet, RPC, SMB, SQL, RDP
    return suspiciousPorts.includes(localPort);
  }

  isRapidConnection(ip) {
    // Check for rapid connection attempts from same IP
    const recentConnections = Array.from(this.connections.values())
      .filter(conn => 
        conn.remoteAddress === ip && 
        Date.now() - conn.startTime.getTime() < 60000 // Last minute
      );
    
    return recentConnections.length > 10;
  }

  async analyzeNetworkTraffic() {
    // Simulate traffic analysis
    const trafficData = {
      inbound: Math.random() * 1000000, // bytes
      outbound: Math.random() * 500000,  // bytes
      packets: Math.floor(Math.random() * 10000),
      errors: Math.floor(Math.random() * 10)
    };

    this.networkStats.dataTransferred += trafficData.inbound + trafficData.outbound;

    // Check for traffic anomalies
    if (trafficData.errors > 5) {
      this.emit('trafficAnomaly', {
        type: 'high_error_rate',
        errors: trafficData.errors,
        timestamp: new Date().toISOString()
      });
    }

    if (trafficData.inbound > 800000) { // High inbound traffic
      this.emit('trafficAnomaly', {
        type: 'high_inbound_traffic',
        inbound: trafficData.inbound,
        timestamp: new Date().toISOString()
      });
    }

    // Send real-time traffic data
    if (this.io) {
      this.io.emit('trafficUpdate', {
        ...trafficData,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkForAnomalies() {
    const anomalies = [];

    // Check for unusual connection patterns
    if (this.connections.size > 100) {
      anomalies.push({
        type: 'high_connection_count',
        value: this.connections.size,
        threshold: 100,
        severity: 'medium'
      });
    }

    // Check for suspicious IP concentration
    const ipCounts = new Map();
    for (const conn of this.connections.values()) {
      const count = ipCounts.get(conn.remoteAddress) || 0;
      ipCounts.set(conn.remoteAddress, count + 1);
    }

    for (const [ip, count] of ipCounts) {
      if (count > 20) {
        anomalies.push({
          type: 'high_connections_from_ip',
          ip,
          count,
          threshold: 20,
          severity: 'high'
        });
      }
    }

    // Report anomalies
    for (const anomaly of anomalies) {
      this.emit('networkAnomaly', {
        ...anomaly,
        timestamp: new Date().toISOString()
      });

      if (this.io) {
        this.io.emit('securityAlert', {
          type: 'network_anomaly',
          severity: anomaly.severity,
          message: `Network anomaly detected: ${anomaly.type}`,
          details: anomaly,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async monitorSystemResources() {
    const systemInfo = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg()
    };

    // Check for resource anomalies
    const memoryUsage = (systemInfo.memory.heapUsed / systemInfo.totalMemory) * 100;
    if (memoryUsage > 80) {
      this.emit('resourceAnomaly', {
        type: 'high_memory_usage',
        usage: memoryUsage,
        threshold: 80,
        timestamp: new Date().toISOString()
      });
    }

    const loadAverage = systemInfo.loadAverage[0];
    if (loadAverage > 4) {
      this.emit('resourceAnomaly', {
        type: 'high_cpu_load',
        load: loadAverage,
        threshold: 4,
        timestamp: new Date().toISOString()
      });
    }

    // Send system metrics
    if (this.io) {
      this.io.emit('systemMetrics', {
        ...systemInfo,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Block an IP address
  blockIP(ip, reason = 'Suspicious activity') {
    this.blockedIPs.add(ip);
    
    this.emit('ipBlocked', {
      ip,
      reason,
      timestamp: new Date().toISOString()
    });

    // In a real implementation, this would update firewall rules
    console.log(`🚫 Blocked IP: ${ip} - ${reason}`);
  }

  // Unblock an IP address
  unblockIP(ip) {
    this.blockedIPs.delete(ip);
    
    this.emit('ipUnblocked', {
      ip,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ Unblocked IP: ${ip}`);
  }

  // Check if IP is blocked
  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Get network security report
  getSecurityReport() {
    const suspiciousConnections = Array.from(this.connections.values())
      .filter(conn => conn.suspicious);

    return {
      timestamp: new Date().toISOString(),
      stats: this.networkStats,
      activeConnections: this.connections.size,
      suspiciousConnections: suspiciousConnections.length,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      connections: Array.from(this.connections.values()).map(conn => ({
        id: `${conn.localAddress}:${conn.localPort}-${conn.remoteAddress}:${conn.remotePort}`,
        remoteAddress: conn.remoteAddress,
        localPort: conn.localPort,
        state: conn.state,
        suspicious: conn.suspicious,
        duration: Date.now() - conn.startTime.getTime()
      }))
    };
  }

  // Get real-time dashboard data
  getDashboardData() {
    return {
      activeConnections: this.connections.size,
      blockedIPs: this.blockedIPs.size,
      suspiciousActivities: this.networkStats.suspiciousActivities,
      dataTransferred: this.networkStats.dataTransferred,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  // Stop monitoring
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isActive = false;
    console.log('🛑 Network monitoring stopped');
  }

  isActive() {
    return this.isActive;
  }

  getStats() {
    return {
      isActive: this.isActive,
      activeConnections: this.connections.size,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      ...this.networkStats
    };
  }
}

module.exports = new NetworkSecurityMonitor();
