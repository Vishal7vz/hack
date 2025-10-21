# 🔧 SecureShield Setup Guide

## Required API Keys & Configuration

### 1. **Infura API Key (For Web3 Features)**

Your SecureShield project includes Web3 identity verification that requires an Infura API key to connect to Ethereum blockchain.

#### How to get Infura API Key:
1. Go to [infura.io](https://infura.io)
2. Sign up for a free account
3. Create a new project
4. Copy your Project ID (this is your API key)
5. Add it to your `.env` file

#### Update your `.env` file:
```env
INFURA_API_KEY=868591ab2b294bdf8380ebc1c075eb7b
```

### 2. **Environment Variables**

The `.env` file has been created with the following variables:

```env
# JWT Secret for authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Web3/Blockchain Configuration
INFURA_API_KEY=868591ab2b294bdf8380ebc1c075eb7b

# Client Configuration (optional - defaults work for local development)
REACT_APP_API_URL=http://localhost:5000
```

### 3. **What Each API Key Does:**

#### ✅ **Infura API Key** (Required for Web3 features)
- **Purpose**: Connects to Ethereum Sepolia testnet for Web3 identity verification
- **Features it enables**: 
  - Creating decentralized identities
  - Blockchain-based credential verification
  - Smart contract interactions
- **Impact if missing**: Web3 identity features will fail to initialize

#### ✅ **JWT_SECRET** (Required for authentication)
- **Purpose**: Signs and verifies JWT tokens for user authentication
- **Features it enables**:
  - User login/registration
  - Secure session management
  - Protected API endpoints
- **Impact if missing**: Authentication system won't work

### 4. **Quick Setup Steps:**

1. **Get Infura API Key** (5 minutes):
   - Visit [infura.io](https://infura.io)
   - Sign up → Create Project → Copy Project ID

2. **Update .env file**:
   ```bash
   # Replace 'your-infura-api-key-here' with your actual Infura Project ID
   INFURA_API_KEY=your-actual-project-id
   ```

3. **Install dependencies**:
   ```bash
   npm run install-all
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

### 5. **Optional Enhancements:**

#### For Production Deployment:
- Use a strong, unique JWT_SECRET (at least 32 characters)
- Consider using environment-specific Infura keys
- Set up proper database (currently uses in-memory storage)

#### For Advanced Web3 Features:
- Deploy your own smart contracts for identity verification
- Use mainnet instead of Sepolia testnet (requires real ETH)
- Implement more sophisticated credential systems

### 6. **Troubleshooting:**

#### Web3 Connection Issues:
- Verify your Infura API key is correct
- Check if you have internet connectivity
- Ensure you're using the correct network (Sepolia testnet)

#### Authentication Issues:
- Verify JWT_SECRET is set in .env
- Restart the server after changing environment variables
- Check browser console for token-related errors

### 7. **Security Notes:**

⚠️ **Important Security Considerations:**
- Never commit your `.env` file to version control
- Use different API keys for development and production
- The current setup uses demo wallets - don't use real funds
- JWT_SECRET should be cryptographically secure

## 🚀 You're Ready!

Once you've added your Infura API key to the `.env` file, your SecureShield application will work smoothly with all features enabled:

- ✅ AI-powered threat detection
- ✅ Secure data sharing
- ✅ Web3 identity verification  
- ✅ Network security monitoring

The application will automatically use these keys when you run `npm run dev`!
