const threatDetection = require('../../modules/threatDetection');
const secureSharing = require('../../modules/secureSharing');
const web3Identity = require('../../modules/web3Identity');
const networkSecurity = require('../../modules/networkSecurity');
const passwordGenerator = require('../../modules/passwordGenerator');
const { parseJsonBody, sendJson } = require('../_utils');

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split('/').slice(3); // ['', 'api', 'security', ...]
    const [section, action, extra] = parts;

    // Threats
    if (section === 'threats') {
      if (req.method === 'GET' && action === 'stats') {
        const stats = threatDetection.getStats();
        return sendJson(res, 200, stats);
      }
      if (req.method === 'POST' && action === 'analyze') {
        const body = await parseJsonBody(req);
        const { request } = body || {};
        const threats = threatDetection.analyzeRequest(request);
        return sendJson(res, 200, { threats, count: threats.length });
      }
    }

    // Sharing
    if (section === 'sharing') {
      const body = await parseJsonBody(req);
      if (req.method === 'POST' && action === 'create-session') {
        const { participants, data, options } = body || {};
        const result = secureSharing.createSharingSession(participants, data, options);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'access') {
        const { sessionId, participantId, password } = body || {};
        const result = secureSharing.accessSharedData(sessionId, participantId, password);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'revoke') {
        const { sessionId, participantId } = body || {};
        const result = secureSharing.revokeSession(sessionId, participantId);
        return sendJson(res, 200, { success: result });
      }
      if (req.method === 'GET' && action === 'stats') {
        const stats = secureSharing.getStats();
        return sendJson(res, 200, stats);
      }
    }

    // Identity
    if (section === 'identity') {
      if (req.method === 'POST' && action === 'create') {
        const body = await parseJsonBody(req);
        const result = await web3Identity.createIdentity(body.userData);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'verify') {
        const body = await parseJsonBody(req);
        const result = await web3Identity.verifyIdentity(body.identityId, body.providedData);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'credential' && extra === 'issue') {
        const body = await parseJsonBody(req);
        const result = await web3Identity.issueCredential(body.identityId, body.credentialType, body.credentialData);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'credential' && extra === 'verify') {
        const body = await parseJsonBody(req);
        const result = await web3Identity.verifyCredential(body.credentialId, body.identityId);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'permission' && extra === 'create') {
        const body = await parseJsonBody(req);
        const result = await web3Identity.createPermission(body.identityId, body.resource, body.actions);
        return sendJson(res, 200, result);
      }
      if (req.method === 'GET' && action && action !== 'stats') {
        const result = web3Identity.getIdentity(action);
        if (!result) return sendJson(res, 404, { error: 'Identity not found' });
        return sendJson(res, 200, result);
      }
      if (req.method === 'GET' && !action) {
        const result = web3Identity.getAllIdentities();
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action && extra === 'revoke') {
        const result = await web3Identity.revokeIdentity(action);
        return sendJson(res, 200, { success: result });
      }
      if (req.method === 'GET' && action === 'stats') {
        const stats = web3Identity.getStats();
        return sendJson(res, 200, stats);
      }
    }

    // Network
    if (section === 'network') {
      if (req.method === 'GET' && action === 'dashboard') {
        const data = networkSecurity.getDashboardData();
        return sendJson(res, 200, data);
      }
      if (req.method === 'GET' && action === 'report') {
        const report = networkSecurity.getSecurityReport();
        return sendJson(res, 200, report);
      }
      if (req.method === 'POST' && action === 'block-ip') {
        const body = await parseJsonBody(req);
        networkSecurity.blockIP(body.ip, body.reason);
        return sendJson(res, 200, { success: true, message: `IP ${body.ip} blocked` });
      }
      if (req.method === 'POST' && action === 'unblock-ip') {
        const body = await parseJsonBody(req);
        networkSecurity.unblockIP(body.ip);
        return sendJson(res, 200, { success: true, message: `IP ${body.ip} unblocked` });
      }
      if (req.method === 'GET' && action === 'blocked-ips') {
        const blockedIPs = Array.from(networkSecurity.blockedIPs);
        return sendJson(res, 200, { blockedIPs });
      }
      if (req.method === 'GET' && action === 'stats') {
        const stats = networkSecurity.getStats();
        return sendJson(res, 200, stats);
      }
    }

    // Overview
    if (section === 'overview' && req.method === 'GET') {
      const overview = {
        timestamp: new Date().toISOString(),
        threatDetection: threatDetection.getStats(),
        secureSharing: secureSharing.getStats(),
        web3Identity: web3Identity.getStats(),
        networkSecurity: networkSecurity.getStats(),
        passwordGenerator: passwordGenerator.getStats(),
      };
      return sendJson(res, 200, overview);
    }

    // Passwords
    if (section === 'passwords') {
      const body = ['POST'].includes(req.method) ? await parseJsonBody(req) : undefined;
      if (req.method === 'POST' && action === 'generate') {
        const result = passwordGenerator.generatePassword(body);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'generate-memorable') {
        const { wordCount, separator, includeNumbers } = body || {};
        const result = passwordGenerator.generateMemorablePassword(wordCount, separator, includeNumbers);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'generate-requirements') {
        const result = passwordGenerator.generatePasswordWithRequirements(body);
        return sendJson(res, 200, result);
      }
      if (req.method === 'POST' && action === 'generate-multiple') {
        const { count, options } = body || {};
        const result = passwordGenerator.generateMultiplePasswords(count, options);
        return sendJson(res, 200, { passwords: result });
      }
      if (req.method === 'GET' && action === 'history') {
        const limit = parseInt((new URL(req.url, `http://${req.headers.host}`)).searchParams.get('limit') || '10');
        const history = passwordGenerator.getHistory(limit);
        return sendJson(res, 200, { history });
      }
      if (req.method === 'DELETE' && action === 'history') {
        passwordGenerator.clearHistory();
        return sendJson(res, 200, { success: true, message: 'History cleared' });
      }
      if (req.method === 'GET' && action === 'stats') {
        const stats = passwordGenerator.getStats();
        return sendJson(res, 200, { stats });
      }
    }

    // Alerts (demo)
    if (section === 'alerts' && req.method === 'GET') {
      const alerts = [
        { id: 1, type: 'threat_detected', severity: 'high', message: 'SQL injection attempt detected', timestamp: new Date().toISOString(), resolved: false },
        { id: 2, type: 'suspicious_connection', severity: 'medium', message: 'Suspicious connection from 192.168.1.100', timestamp: new Date().toISOString(), resolved: false },
        { id: 3, type: 'network_anomaly', severity: 'low', message: 'High connection count detected', timestamp: new Date().toISOString(), resolved: true },
      ];
      return sendJson(res, 200, alerts);
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (e) {
    return sendJson(res, 500, { error: e.message });
  }
};
