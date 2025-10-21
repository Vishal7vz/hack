const express = require('express');
const threatDetection = require('../modules/threatDetection');
const secureSharing = require('../modules/secureSharing');
const web3Identity = require('../modules/web3Identity');
const networkSecurity = require('../modules/networkSecurity');
const passwordGenerator = require('../modules/passwordGenerator');
const router = express.Router();

// Threat Detection Routes
router.get('/threats/stats', (req, res) => {
  try {
    const stats = threatDetection.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/threats/analyze', (req, res) => {
  try {
    const { request } = req.body;
    const threats = threatDetection.analyzeRequest(request);
    res.json({ threats, count: threats.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Secure Sharing Routes
router.post('/sharing/create-session', (req, res) => {
  try {
    const { participants, data, options } = req.body;
    const result = secureSharing.createSharingSession(participants, data, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sharing/access', (req, res) => {
  try {
    const { sessionId, participantId, password } = req.body;
    const result = secureSharing.accessSharedData(sessionId, participantId, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sharing/revoke', (req, res) => {
  try {
    const { sessionId, participantId } = req.body;
    const result = secureSharing.revokeSession(sessionId, participantId);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sharing/stats', (req, res) => {
  try {
    const stats = secureSharing.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Web3 Identity Routes
router.post('/identity/create', async (req, res) => {
  try {
    const { userData } = req.body;
    const result = await web3Identity.createIdentity(userData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/identity/verify', async (req, res) => {
  try {
    const { identityId, providedData } = req.body;
    const result = await web3Identity.verifyIdentity(identityId, providedData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/identity/credential/issue', async (req, res) => {
  try {
    const { identityId, credentialType, credentialData } = req.body;
    const result = await web3Identity.issueCredential(identityId, credentialType, credentialData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/identity/credential/verify', async (req, res) => {
  try {
    const { credentialId, identityId } = req.body;
    const result = await web3Identity.verifyCredential(credentialId, identityId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/identity/permission/create', async (req, res) => {
  try {
    const { identityId, resource, actions } = req.body;
    const result = await web3Identity.createPermission(identityId, resource, actions);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/identity/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = web3Identity.getIdentity(id);
    if (!result) {
      return res.status(404).json({ error: 'Identity not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/identity', (req, res) => {
  try {
    const result = web3Identity.getAllIdentities();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/identity/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await web3Identity.revokeIdentity(id);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/identity/stats', (req, res) => {
  try {
    const stats = web3Identity.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Network Security Routes
router.get('/network/dashboard', (req, res) => {
  try {
    const data = networkSecurity.getDashboardData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/network/report', (req, res) => {
  try {
    const report = networkSecurity.getSecurityReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/network/block-ip', (req, res) => {
  try {
    const { ip, reason } = req.body;
    networkSecurity.blockIP(ip, reason);
    res.json({ success: true, message: `IP ${ip} blocked` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/network/unblock-ip', (req, res) => {
  try {
    const { ip } = req.body;
    networkSecurity.unblockIP(ip);
    res.json({ success: true, message: `IP ${ip} unblocked` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/network/blocked-ips', (req, res) => {
  try {
    const blockedIPs = Array.from(networkSecurity.blockedIPs);
    res.json({ blockedIPs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/network/stats', (req, res) => {
  try {
    const stats = networkSecurity.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Security Overview Route
router.get('/overview', (req, res) => {
  try {
    const overview = {
      timestamp: new Date().toISOString(),
      threatDetection: threatDetection.getStats(),
      secureSharing: secureSharing.getStats(),
      web3Identity: web3Identity.getStats(),
      networkSecurity: networkSecurity.getStats(),
      passwordGenerator: passwordGenerator.getStats()
    };
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password Generator Routes
router.post('/passwords/generate', (req, res) => {
  try {
    const result = passwordGenerator.generatePassword(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/passwords/generate-memorable', (req, res) => {
  try {
    const { wordCount, separator, includeNumbers } = req.body;
    const result = passwordGenerator.generateMemorablePassword(wordCount, separator, includeNumbers);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/passwords/generate-requirements', (req, res) => {
  try {
    const result = passwordGenerator.generatePasswordWithRequirements(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/passwords/generate-multiple', (req, res) => {
  try {
    const { count, options } = req.body;
    const result = passwordGenerator.generateMultiplePasswords(count, options);
    res.json({ passwords: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/passwords/history', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const history = passwordGenerator.getHistory(parseInt(limit));
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/passwords/history', (req, res) => {
  try {
    passwordGenerator.clearHistory();
    res.json({ success: true, message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/passwords/stats', (req, res) => {
  try {
    const stats = passwordGenerator.getStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Security Alert Route
router.get('/alerts', (req, res) => {
  try {
    // In a real implementation, this would fetch from a database
    const alerts = [
      {
        id: 1,
        type: 'threat_detected',
        severity: 'high',
        message: 'SQL injection attempt detected',
        timestamp: new Date().toISOString(),
        resolved: false
      },
      {
        id: 2,
        type: 'suspicious_connection',
        severity: 'medium',
        message: 'Suspicious connection from 192.168.1.100',
        timestamp: new Date().toISOString(),
        resolved: false
      },
      {
        id: 3,
        type: 'network_anomaly',
        severity: 'low',
        message: 'High connection count detected',
        timestamp: new Date().toISOString(),
        resolved: true
      }
    ];
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
