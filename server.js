const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import modules
const threatDetection = require('./modules/threatDetection');
const secureSharing = require('./modules/secureSharing');
const web3Identity = require('./modules/web3Identity');
const networkSecurity = require('./modules/networkSecurity');
const passwordGenerator = require('./modules/passwordGenerator');
const authRoutes = require('./routes/auth');
const securityRoutes = require('./routes/security');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/security', securityRoutes);

// Real-time threat monitoring
io.on('connection', (socket) => {
  console.log('Client connected to security monitoring');
  
  socket.on('subscribe-threats', () => {
    socket.join('threat-monitoring');
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from security monitoring');
  });
});

// Initialize security modules
threatDetection.initialize();
networkSecurity.initialize(io);
passwordGenerator.initialize();

// Broadcast threat alerts
threatDetection.on('threatDetected', (threatData) => {
  io.to('threat-monitoring').emit('threatAlert', threatData);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      threatDetection: threatDetection.isActive(),
      networkSecurity: networkSecurity.isActive(),
      secureSharing: secureSharing.isActive(),
      web3Identity: web3Identity.isActive(),
      passwordGenerator: passwordGenerator.isActive()
    }
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SecureShield Server running on port ${PORT}`);
  console.log(`🔒 Security modules initialized`);
  console.log(`🌐 WebSocket server active for real-time monitoring`);
});

module.exports = { app, io };
