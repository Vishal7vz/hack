# SecureShield Deployment Guide

## 🚀 Complete Deployment Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

## 📋 Development Setup

### 1. Backend Server (Port 5000)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# OR
node server.js
```

### 2. Frontend React App (Port 3000)
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Individual Docker Containers
```bash
# Backend only
docker build -t secureshield-backend .
docker run -p 5000:5000 secureshield-backend

# Frontend only
cd client
docker build -t secureshield-frontend .
docker run -p 3000:3000 secureshield-frontend
```

## ☁️ Production Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run vercel-build`
3. Set output directory: `build`
4. Deploy automatically on git push

### Manual Production Build
```bash
# Build frontend
cd client
npm run build

# Copy build to root
cp -r build ../build

# Start production server
cd ..
npm start
```

## 🔧 Environment Variables

Create `.env` file in root directory:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
INFURA_API_KEY=your-infura-key
```

## 📊 Health Checks

### Backend Health
- **URL**: `http://localhost:5000/api/health`
- **Expected Response**: JSON with service status

### Frontend Health
- **URL**: `http://localhost:3000`
- **Expected Response**: React app loads successfully

## 🧪 Testing Endpoints

### API Endpoints Tested ✅
- `GET /api/health` - Health check
- `GET /api/security/overview` - Security overview
- `GET /api/security/network/dashboard` - Network stats
- `POST /api/security/passwords/generate` - Password generation
- `GET /api/security/alerts` - Security alerts

### Frontend Routes Tested ✅
- `/` - Dashboard
- `/threats` - Threat Detection
- `/sharing` - Secure Sharing
- `/identity` - Web3 Identity
- `/network` - Network Security
- `/passwords` - Password Generator

## 🛠️ Troubleshooting

### Common Issues & Solutions

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 5000
   netstat -ano | findstr :3000
   taskkill /F /PID <PID>
   netstat -ano | findstr :5000
   taskkill /F /PID <PID>
   ```

2. **Module Import Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check file paths and imports

3. **Build Failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check for ESLint warnings and fix them

4. **API Connection Issues**
   - Verify backend is running on port 5000
   - Check CORS settings in server.js
   - Ensure proxy configuration in client/package.json

## 📈 Performance Optimization

### Production Optimizations
- ✅ Minified JavaScript and CSS
- ✅ Gzip compression enabled
- ✅ Static file serving optimized
- ✅ Security headers configured
- ✅ Rate limiting implemented

### Monitoring
- Real-time WebSocket connections
- Health check endpoints
- Error logging and monitoring
- Performance metrics

## 🔒 Security Features

### Implemented Security Measures
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 requests/15min)
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Content Security Policy

## 📱 Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Quick Start Commands

```bash
# Full development setup
npm run install-all
npm run dev

# Production deployment
npm run build
npm start

# Docker deployment
docker-compose up --build
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Ensure all dependencies are installed
4. Verify port availability

---

**Status**: ✅ All systems operational and ready for deployment!
