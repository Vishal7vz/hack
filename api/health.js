const threatDetection = require('../modules/threatDetection');
const secureSharing = require('../modules/secureSharing');
const web3Identity = require('../modules/web3Identity');
const networkSecurity = require('../modules/networkSecurity');
const passwordGenerator = require('../modules/passwordGenerator');

module.exports = (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        threatDetection: threatDetection.isActive,
        networkSecurity: networkSecurity.isActive,
        secureSharing: secureSharing.isActive,
        web3Identity: web3Identity.isActive,
        passwordGenerator: passwordGenerator.isActive,
      },
    });
  } catch (e) {
    res.status(500).json({ status: 'unhealthy', error: e.message });
  }
};
