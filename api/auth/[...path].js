const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendJson, parseJsonBody } = require('../_utils');

// In-memory users store (stateless across serverless invocations)
// For production, replace with a persistent DB
const users = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getPathParts(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return url.pathname.split('/').slice(3); // ['', 'api', 'auth', ...]
}

function authenticate(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  try {
    const [action] = getPathParts(req);

    // Register
    if (req.method === 'POST' && action === 'register') {
      const body = await parseJsonBody(req);
      const { username, email, password } = body || {};
      if (!username || !email || !password || password.length < 6) {
        return sendJson(res, 400, { message: 'Invalid input' });
      }
      if (users.has(email)) {
        return sendJson(res, 400, { message: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
      };
      users.set(email, user);
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      return sendJson(res, 201, {
        message: 'User registered successfully',
        token,
        user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
      });
    }

    // Login
    if (req.method === 'POST' && action === 'login') {
      const body = await parseJsonBody(req);
      const { email, password } = body || {};
      if (!email || !password) {
        return sendJson(res, 400, { message: 'Invalid input' });
      }
      const user = users.get(email);
      if (!user) return sendJson(res, 401, { message: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return sendJson(res, 401, { message: 'Invalid credentials' });
      user.lastLogin = new Date().toISOString();
      users.set(email, user);
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      return sendJson(res, 200, {
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email, lastLogin: user.lastLogin },
      });
    }

    // Verify
    if (req.method === 'GET' && action === 'verify') {
      const decoded = authenticate(req);
      if (!decoded) return sendJson(res, 401, { message: 'Invalid token' });
      const user = Array.from(users.values()).find((u) => u.id === decoded.userId);
      if (!user) return sendJson(res, 401, { message: 'User not found' });
      return sendJson(res, 200, {
        valid: true,
        user: { id: user.id, username: user.username, email: user.email, lastLogin: user.lastLogin },
      });
    }

    // Logout (client removes token)
    if (req.method === 'POST' && action === 'logout') {
      return sendJson(res, 200, { message: 'Logout successful' });
    }

    // Profile
    if (req.method === 'GET' && action === 'profile') {
      const decoded = authenticate(req);
      if (!decoded) return sendJson(res, 401, { message: 'Access denied. No token provided.' });
      const user = Array.from(users.values()).find((u) => u.id === decoded.userId);
      if (!user) return sendJson(res, 404, { message: 'User not found' });
      return sendJson(res, 200, {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      });
    }

    return sendJson(res, 404, { message: 'Not found' });
  } catch (e) {
    return sendJson(res, 500, { message: 'Server error', error: e.message });
  }
};
