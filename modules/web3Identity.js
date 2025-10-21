const { ethers } = require('ethers');
const crypto = require('crypto');
const EventEmitter = require('events');

class Web3IdentityVerification extends EventEmitter {
  constructor() {
    super();
    this.isActive = false;
    this.identities = new Map();
    this.verificationContracts = new Map();
    this.provider = null;
    this.signer = null;
  }

  async initialize() {
    try {
      // Initialize Ethereum provider (using Sepolia testnet for demo)
      const infuraKey = process.env.INFURA_API_KEY || '868591ab2b294bdf8380ebc1c075eb7b';
      this.provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraKey}`);
      
      // Create a random wallet for demo purposes
      this.signer = ethers.Wallet.createRandom().connect(this.provider);
      
      this.isActive = true;
      console.log('✅ Web3 Identity Verification initialized');
      console.log(`🔑 Demo wallet address: ${this.signer.address}`);
      
      // Initialize identity verification contracts
      await this.initializeContracts();
    } catch (error) {
      console.error('❌ Failed to initialize Web3 Identity:', error);
    }
  }

  async initializeContracts() {
    // Simple Identity Registry Contract ABI
    const identityRegistryABI = [
      "function registerIdentity(string memory _identifier, bytes32 _hash) public",
      "function verifyIdentity(string memory _identifier, bytes32 _hash) public view returns (bool)",
      "function revokeIdentity(string memory _identifier) public",
      "function getIdentityHash(string memory _identifier) public view returns (bytes32)",
      "event IdentityRegistered(string indexed identifier, address indexed owner, uint256 timestamp)",
      "event IdentityVerified(string indexed identifier, bool verified, uint256 timestamp)",
      "event IdentityRevoked(string indexed identifier, address indexed owner, uint256 timestamp)"
    ];

    // For demo purposes, we'll simulate contract interactions
    this.contractABI = identityRegistryABI;
    console.log('📋 Identity Registry Contract ABI loaded');
  }

  // Create a new decentralized identity
  async createIdentity(userData) {
    try {
      const identityId = crypto.randomUUID();
      const identityHash = this.generateIdentityHash(userData);
      
      // Create identity object
      const identity = {
        id: identityId,
        address: this.signer.address,
        hash: identityHash,
        data: this.encryptIdentityData(userData),
        createdAt: new Date().toISOString(),
        verified: false,
        credentials: [],
        permissions: []
      };

      // Store identity locally
      this.identities.set(identityId, identity);

      // Simulate blockchain registration
      await this.registerOnBlockchain(identityId, identityHash);

      this.emit('identityCreated', {
        identityId,
        address: identity.address,
        timestamp: new Date().toISOString()
      });

      return {
        identityId,
        address: identity.address,
        hash: identityHash,
        privateKey: this.signer.privateKey // In production, this should be handled securely
      };
    } catch (error) {
      throw new Error(`Identity creation failed: ${error.message}`);
    }
  }

  // Generate a hash for identity verification
  generateIdentityHash(userData) {
    const dataString = JSON.stringify(userData, Object.keys(userData).sort());
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  // Encrypt sensitive identity data
  encryptIdentityData(data) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm
    };
  }

  // Decrypt identity data
  decryptIdentityData(encryptedData, key) {
    const decipher = crypto.createDecipher(encryptedData.algorithm, key);
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // Simulate blockchain registration
  async registerOnBlockchain(identityId, hash) {
    // In a real implementation, this would interact with a smart contract
    console.log(`📝 Registering identity ${identityId} on blockchain...`);
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Identity ${identityId} registered on blockchain`);
    return {
      txHash: crypto.randomBytes(32).toString('hex'),
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000
    };
  }

  // Verify identity using blockchain
  async verifyIdentity(identityId, providedData) {
    try {
      const identity = this.identities.get(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      // Generate hash from provided data
      const providedHash = this.generateIdentityHash(providedData);
      
      // Compare with stored hash
      const isValid = identity.hash === providedHash;
      
      // Update verification status
      identity.verified = isValid;
      identity.lastVerified = new Date().toISOString();

      // Simulate blockchain verification
      await this.verifyOnBlockchain(identityId, isValid);

      this.emit('identityVerified', {
        identityId,
        verified: isValid,
        timestamp: new Date().toISOString()
      });

      return {
        verified: isValid,
        identityId,
        address: identity.address,
        verificationTimestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Identity verification failed: ${error.message}`);
    }
  }

  // Simulate blockchain verification
  async verifyOnBlockchain(identityId, isValid) {
    console.log(`🔍 Verifying identity ${identityId} on blockchain...`);
    
    // Simulate blockchain query
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`✅ Identity ${identityId} verification result: ${isValid}`);
    return {
      txHash: crypto.randomBytes(32).toString('hex'),
      verified: isValid
    };
  }

  // Issue a credential (like a digital certificate)
  async issueCredential(identityId, credentialType, credentialData) {
    try {
      const identity = this.identities.get(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      const credential = {
        id: crypto.randomUUID(),
        type: credentialType,
        data: credentialData,
        issuer: this.signer.address,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        signature: await this.signCredential(credentialData),
        verified: false
      };

      identity.credentials.push(credential);

      this.emit('credentialIssued', {
        identityId,
        credentialId: credential.id,
        type: credentialType,
        timestamp: new Date().toISOString()
      });

      return credential;
    } catch (error) {
      throw new Error(`Credential issuance failed: ${error.message}`);
    }
  }

  // Sign a credential
  async signCredential(credentialData) {
    const message = JSON.stringify(credentialData);
    const signature = await this.signer.signMessage(message);
    return signature;
  }

  // Verify a credential
  async verifyCredential(credentialId, identityId) {
    try {
      const identity = this.identities.get(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      const credential = identity.credentials.find(c => c.id === credentialId);
      if (!credential) {
        throw new Error('Credential not found');
      }

      // Check if credential has expired
      if (new Date() > new Date(credential.expiresAt)) {
        throw new Error('Credential has expired');
      }

      // Verify signature
      const message = JSON.stringify(credential.data);
      const recoveredAddress = ethers.verifyMessage(message, credential.signature);
      const isValid = recoveredAddress === credential.issuer;

      credential.verified = isValid;
      credential.lastVerified = new Date().toISOString();

      this.emit('credentialVerified', {
        identityId,
        credentialId,
        verified: isValid,
        timestamp: new Date().toISOString()
      });

      return {
        verified: isValid,
        credential,
        recoveredAddress
      };
    } catch (error) {
      throw new Error(`Credential verification failed: ${error.message}`);
    }
  }

  // Create a permission for accessing resources
  async createPermission(identityId, resource, actions) {
    try {
      const identity = this.identities.get(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      const permission = {
        id: crypto.randomUUID(),
        resource,
        actions,
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        grantedBy: this.signer.address,
        active: true
      };

      identity.permissions.push(permission);

      this.emit('permissionCreated', {
        identityId,
        permissionId: permission.id,
        resource,
        actions,
        timestamp: new Date().toISOString()
      });

      return permission;
    } catch (error) {
      throw new Error(`Permission creation failed: ${error.message}`);
    }
  }

  // Check if identity has permission for a resource
  hasPermission(identityId, resource, action) {
    const identity = this.identities.get(identityId);
    if (!identity) return false;

    const permission = identity.permissions.find(p => 
      p.resource === resource && 
      p.actions.includes(action) && 
      p.active &&
      new Date() < new Date(p.expiresAt)
    );

    return !!permission;
  }

  // Revoke an identity
  async revokeIdentity(identityId) {
    try {
      const identity = this.identities.get(identityId);
      if (!identity) {
        throw new Error('Identity not found');
      }

      // Mark identity as revoked
      identity.revoked = true;
      identity.revokedAt = new Date().toISOString();
      identity.revokedBy = this.signer.address;

      // Revoke all permissions
      identity.permissions.forEach(p => {
        p.active = false;
        p.revokedAt = new Date().toISOString();
      });

      // Simulate blockchain revocation
      await this.revokeOnBlockchain(identityId);

      this.emit('identityRevoked', {
        identityId,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      throw new Error(`Identity revocation failed: ${error.message}`);
    }
  }

  // Simulate blockchain revocation
  async revokeOnBlockchain(identityId) {
    console.log(`🚫 Revoking identity ${identityId} on blockchain...`);
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Identity ${identityId} revoked on blockchain`);
    return {
      txHash: crypto.randomBytes(32).toString('hex'),
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000
    };
  }

  // Get identity information
  getIdentity(identityId) {
    const identity = this.identities.get(identityId);
    if (!identity) return null;

    return {
      id: identity.id,
      address: identity.address,
      verified: identity.verified,
      createdAt: identity.createdAt,
      lastVerified: identity.lastVerified,
      credentialsCount: identity.credentials.length,
      permissionsCount: identity.permissions.length,
      revoked: identity.revoked || false
    };
  }

  // Get all identities
  getAllIdentities() {
    return Array.from(this.identities.values()).map(identity => ({
      id: identity.id,
      address: identity.address,
      verified: identity.verified,
      createdAt: identity.createdAt,
      revoked: identity.revoked || false
    }));
  }

  // Get statistics
  getStats() {
    const identities = Array.from(this.identities.values());
    return {
      isActive: this.isActive,
      totalIdentities: identities.length,
      verifiedIdentities: identities.filter(i => i.verified).length,
      revokedIdentities: identities.filter(i => i.revoked).length,
      totalCredentials: identities.reduce((sum, i) => sum + i.credentials.length, 0),
      totalPermissions: identities.reduce((sum, i) => sum + i.permissions.length, 0)
    };
  }

  isActive() {
    return this.isActive;
  }
}

module.exports = new Web3IdentityVerification();
