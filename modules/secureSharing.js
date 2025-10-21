const crypto = require('crypto');
const EventEmitter = require('events');

class SecureSharingProtocol extends EventEmitter {
  constructor() {
    super();
    this.isActive = false;
    this.sharedSecrets = new Map();
    this.encryptionAlgorithm = 'aes-256-gcm';
    this.keyDerivationIterations = 100000;
    this.sessionKeys = new Map();
  }

  initialize() {
    this.isActive = true;
    console.log('✅ Secure Data Sharing Protocol initialized');
  }

  // Generate a new encryption key using PBKDF2
  generateKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, this.keyDerivationIterations, 32, 'sha512');
  }

  // Generate a random salt
  generateSalt() {
    return crypto.randomBytes(32);
  }

  // Encrypt data with AES-256-GCM
  encryptData(data, key) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.encryptionAlgorithm, key);
      cipher.setAAD(Buffer.from('secureshield', 'utf8'));
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: this.encryptionAlgorithm
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  // Decrypt data
  decryptData(encryptedData, key) {
    try {
      const decipher = crypto.createDecipher(
        encryptedData.algorithm, 
        key
      );
      
      decipher.setAAD(Buffer.from('secureshield', 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Create a secure sharing session
  createSharingSession(participants, data, options = {}) {
    const sessionId = crypto.randomUUID();
    const password = options.password || crypto.randomBytes(32).toString('hex');
    const salt = this.generateSalt();
    const key = this.generateKey(password, salt);
    
    // Encrypt the data
    const encryptedData = this.encryptData(data, key);
    
    // Create session metadata
    const session = {
      id: sessionId,
      participants: participants.map(p => ({
        id: p.id,
        publicKey: p.publicKey,
        permissions: p.permissions || 'read'
      })),
      encryptedData,
      salt: salt.toString('hex'),
      createdAt: new Date().toISOString(),
      expiresAt: options.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      accessLog: [],
      securityLevel: options.securityLevel || 'high'
    };

    this.sessionKeys.set(sessionId, {
      key: key.toString('hex'),
      password,
      salt: salt.toString('hex')
    });

    this.emit('sessionCreated', {
      sessionId,
      participants: participants.length,
      securityLevel: session.securityLevel
    });

    return {
      sessionId,
      password: options.password ? undefined : password,
      expiresAt: session.expiresAt
    };
  }

  // Access shared data
  accessSharedData(sessionId, participantId, password) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check if participant is authorized
    const participant = session.participants.find(p => p.id === participantId);
    if (!participant) {
      throw new Error('Unauthorized access');
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      throw new Error('Session expired');
    }

    // Get session key
    const sessionKeyData = this.sessionKeys.get(sessionId);
    if (!sessionKeyData) {
      throw new Error('Session key not found');
    }

    // Verify password
    const key = this.generateKey(password, Buffer.from(sessionKeyData.salt, 'hex'));
    if (key.toString('hex') !== sessionKeyData.key) {
      throw new Error('Invalid password');
    }

    // Log access
    session.accessLog.push({
      participantId,
      timestamp: new Date().toISOString(),
      action: 'access'
    });

    // Decrypt and return data
    const decryptedData = this.decryptData(session.encryptedData, key);
    
    this.emit('dataAccessed', {
      sessionId,
      participantId,
      timestamp: new Date().toISOString()
    });

    return {
      data: decryptedData,
      permissions: participant.permissions,
      accessLog: session.accessLog
    };
  }

  // Generate digital signature for data integrity
  signData(data, privateKey) {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(JSON.stringify(data));
    return sign.sign(privateKey, 'hex');
  }

  // Verify digital signature
  verifySignature(data, signature, publicKey) {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(JSON.stringify(data));
    return verify.verify(publicKey, signature, 'hex');
  }

  // Generate RSA key pair
  generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
  }

  // Secure file sharing with chunked encryption
  async shareFile(filePath, participants, options = {}) {
    const fs = require('fs').promises;
    const fileData = await fs.readFile(filePath);
    
    // Split file into chunks for better security
    const chunkSize = options.chunkSize || 1024 * 1024; // 1MB chunks
    const chunks = [];
    
    for (let i = 0; i < fileData.length; i += chunkSize) {
      chunks.push(fileData.slice(i, i + chunkSize));
    }

    // Encrypt each chunk separately
    const encryptedChunks = [];
    const password = options.password || crypto.randomBytes(32).toString('hex');
    const salt = this.generateSalt();
    const key = this.generateKey(password, salt);

    for (let i = 0; i < chunks.length; i++) {
      const chunkData = {
        index: i,
        data: chunks[i].toString('base64'),
        totalChunks: chunks.length
      };
      
      const encryptedChunk = this.encryptData(chunkData, key);
      encryptedChunks.push(encryptedChunk);
    }

    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      type: 'file',
      participants: participants.map(p => ({
        id: p.id,
        permissions: p.permissions || 'read'
      })),
      encryptedChunks,
      salt: salt.toString('hex'),
      originalFileName: path.basename(filePath),
      fileSize: fileData.length,
      chunkSize,
      createdAt: new Date().toISOString(),
      expiresAt: options.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.sessionKeys.set(sessionId, {
      key: key.toString('hex'),
      password,
      salt: salt.toString('hex')
    });

    return {
      sessionId,
      password: options.password ? undefined : password,
      fileInfo: {
        name: session.originalFileName,
        size: session.fileSize,
        chunks: chunks.length
      }
    };
  }

  // Get session information
  getSession(sessionId) {
    // In a real implementation, this would query a database
    // For demo purposes, we'll return mock data
    return {
      id: sessionId,
      participants: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      accessLog: []
    };
  }

  // Revoke session access
  revokeSession(sessionId, participantId) {
    const session = this.getSession(sessionId);
    if (session) {
      session.participants = session.participants.filter(p => p.id !== participantId);
      this.emit('sessionRevoked', { sessionId, participantId });
      return true;
    }
    return false;
  }

  // Get sharing statistics
  getStats() {
    return {
      isActive: this.isActive,
      activeSessions: this.sessionKeys.size,
      encryptionAlgorithm: this.encryptionAlgorithm,
      keyDerivationIterations: this.keyDerivationIterations
    };
  }

  isActive() {
    return this.isActive;
  }
}

module.exports = new SecureSharingProtocol();
