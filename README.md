# SecureShield - Multi-Layer Security Intelligence Platform

A comprehensive cybersecurity platform built for **Hack36 9.0 Secure** hackathon at Motilal Nehru National Institute of Technology Allahabad. This platform addresses multiple security domains including AI-powered threat detection, secure data sharing, Web3 identity verification, and network security monitoring.

## 🚀 Features

### 1. AI-Powered Threat Detection
- Real-time pattern matching for SQL injection, XSS, path traversal, and command injection
- Machine learning-based anomaly detection using TensorFlow.js
- Automated threat analysis and recommendations
- Real-time threat alerts and notifications

### 2. Secure Data Sharing Protocol
- End-to-end encryption using AES-256-GCM
- PBKDF2 key derivation with 100,000 iterations
- Session-based access control with expiration
- Digital signatures for data integrity verification
- Chunked file encryption for large files

### 3. Web3 Identity Verification
- Decentralized identity management using Ethereum blockchain
- Digital credential issuance and verification
- Permission-based access control
- Identity revocation and audit trails
- Smart contract integration for verification

### 4. Network Security Monitoring
- Real-time network connection monitoring
- Suspicious activity detection and blocking
- IP address management and blacklisting
- Traffic analysis and anomaly detection
- System resource monitoring

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **TensorFlow.js** for AI/ML capabilities
- **Ethers.js** for Web3 integration
- **SQLite** for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React.js** with modern hooks
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Socket.io-client** for real-time updates

### Security Features
- Helmet.js for security headers
- Rate limiting with express-rate-limit
- CORS protection
- Input validation and sanitization
- Content Security Policy (CSP)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secureshield-hackathon
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start both server and client
   npm run dev
   
   # Or start individually
   npm start          # Server only
   npm run client     # Client only
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 🎯 Hackathon Theme Alignment

This project directly addresses the **Hack36 9.0 Secure** theme by covering all four key focus areas:

### ✅ Network Security
- Real-time network monitoring and threat detection
- Automated IP blocking and access control
- Traffic analysis and anomaly detection

### ✅ Secure Information Retrieval
- Encrypted data sharing with access control
- Secure session management with expiration
- Digital signatures for data integrity

### ✅ Security in Artificial Intelligence
- AI-powered threat detection using machine learning
- Pattern recognition for attack vectors
- Automated security recommendations

### ✅ Web3 and Web2 Security
- Decentralized identity verification using blockchain
- Smart contract integration for verification
- Traditional web security with modern Web3 features

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `GET /api/auth/profile` - User profile

### Security Modules
- `GET /api/security/overview` - Security overview
- `GET /api/security/alerts` - Security alerts
- `POST /api/security/threats/analyze` - Analyze request for threats
- `POST /api/security/sharing/create-session` - Create sharing session
- `POST /api/security/identity/create` - Create Web3 identity
- `GET /api/security/network/dashboard` - Network dashboard data

## 🎨 Screenshots

### Dashboard
- Real-time security metrics
- Interactive charts and visualizations
- Live threat monitoring
- System health indicators

### Threat Detection
- AI-powered threat analysis
- Pattern matching results
- Real-time threat alerts
- Security recommendations

### Secure Sharing
- Encrypted data sharing interface
- Session management
- Access control settings
- Audit trail visualization

### Web3 Identity
- Identity creation and management
- Credential verification
- Permission management
- Blockchain integration

### Network Security
- Real-time network monitoring
- IP management interface
- Connection analysis
- Security reports

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Build the React app: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

### Cloud Deployment
- **Heroku**: Ready for Heroku deployment
- **AWS**: Compatible with AWS EC2 and ECS
- **DigitalOcean**: Works with Droplets and App Platform
- **Vercel**: Frontend can be deployed to Vercel

## 🔒 Security Considerations

- All data is encrypted in transit and at rest
- JWT tokens with expiration for authentication
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Security headers with Helmet.js
- Regular security updates and patches

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Hackathon Submission

This project was developed for **Hack36 9.0 Secure** hackathon at MNNIT Allahabad, addressing the cybersecurity theme with innovative solutions across multiple security domains.

### Key Innovations
- Multi-layer security approach
- AI-powered threat detection
- Web3 integration for identity verification
- Real-time monitoring and alerting
- Modern, responsive user interface

### Future Enhancements
- Machine learning model improvements
- Additional blockchain integrations
- Advanced analytics and reporting
- Mobile application development
- Enterprise features and scalability

## 📞 Contact

For questions or support regarding this project, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Hack36 9.0 Secure Hackathon**
# hack
