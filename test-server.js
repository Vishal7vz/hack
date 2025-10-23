const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const BASE_URL = 'http://localhost:5000';

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test function
async function test(name, testFn) {
  totalTests++;
  try {
    await testFn();
    passedTests++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } catch (error) {
    failedTests++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Assert function
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Main test suite
async function runTests() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  SecureShield Server Test Suite${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Wait for server to be ready
  console.log(`${colors.yellow}Waiting for server to start...${colors.reset}\n`);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 1: Health Check
  console.log(`${colors.blue}[Health Check]${colors.reset}`);
  await test('GET /api/health - Server is healthy', async () => {
    const res = await makeRequest('GET', '/api/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'healthy', 'Server should be healthy');
    assert(res.data.services, 'Should return services status');
  });

  // Test 2: Security Overview
  console.log(`\n${colors.blue}[Security Overview]${colors.reset}`);
  await test('GET /api/security/overview - Get security overview', async () => {
    const res = await makeRequest('GET', '/api/security/overview');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.threatDetection, 'Should include threatDetection stats');
    assert(res.data.networkSecurity, 'Should include networkSecurity stats');
  });

  // Test 3: Threat Detection
  console.log(`\n${colors.blue}[Threat Detection]${colors.reset}`);
  await test('GET /api/security/threats/stats - Get threat stats', async () => {
    const res = await makeRequest('GET', '/api/security/threats/stats');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('POST /api/security/threats/analyze - Analyze request for threats', async () => {
    const res = await makeRequest('POST', '/api/security/threats/analyze', {
      request: {
        url: 'http://example.com/test',
        method: 'GET',
        body: 'test data',
        ip: '192.168.1.1'
      }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.hasOwnProperty('threats'), 'Should return threats array');
  });

  // Test 4: Network Security
  console.log(`\n${colors.blue}[Network Security]${colors.reset}`);
  await test('GET /api/security/network/stats - Get network stats', async () => {
    const res = await makeRequest('GET', '/api/security/network/stats');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('GET /api/security/network/dashboard - Get network dashboard', async () => {
    const res = await makeRequest('GET', '/api/security/network/dashboard');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('GET /api/security/network/report - Get security report', async () => {
    const res = await makeRequest('GET', '/api/security/network/report');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('POST /api/security/network/block-ip - Block an IP address', async () => {
    const res = await makeRequest('POST', '/api/security/network/block-ip', {
      ip: '192.168.1.100',
      reason: 'Test block'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.success === true, 'Should successfully block IP');
  });

  await test('GET /api/security/network/blocked-ips - Get blocked IPs', async () => {
    const res = await makeRequest('GET', '/api/security/network/blocked-ips');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.blockedIPs), 'Should return array of blocked IPs');
  });

  await test('POST /api/security/network/unblock-ip - Unblock an IP address', async () => {
    const res = await makeRequest('POST', '/api/security/network/unblock-ip', {
      ip: '192.168.1.100'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // Test 5: Password Generator
  console.log(`\n${colors.blue}[Password Generator]${colors.reset}`);
  await test('POST /api/security/passwords/generate - Generate password', async () => {
    const res = await makeRequest('POST', '/api/security/passwords/generate', {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.password, 'Should return a password');
    assert(res.data.strength !== undefined, 'Should return strength score');
  });

  await test('POST /api/security/passwords/generate-memorable - Generate memorable password', async () => {
    const res = await makeRequest('POST', '/api/security/passwords/generate-memorable', {
      wordCount: 4,
      separator: '-',
      includeNumbers: true
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.password, 'Should return a password');
  });

  await test('POST /api/security/passwords/generate-multiple - Generate multiple passwords', async () => {
    const res = await makeRequest('POST', '/api/security/passwords/generate-multiple', {
      count: 5,
      options: { length: 12 }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.passwords), 'Should return array of passwords');
    assert(res.data.passwords.length === 5, 'Should return 5 passwords');
  });

  await test('GET /api/security/passwords/stats - Get password stats', async () => {
    const res = await makeRequest('GET', '/api/security/passwords/stats');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // Test 6: Secure Sharing
  console.log(`\n${colors.blue}[Secure Sharing]${colors.reset}`);
  await test('POST /api/security/sharing/create-session - Create sharing session', async () => {
    const res = await makeRequest('POST', '/api/security/sharing/create-session', {
      participants: [
        { id: 'user1', publicKey: 'key1', permissions: 'read' }
      ],
      data: { message: 'Test data' },
      options: { securityLevel: 'high' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.sessionId, 'Should return session ID');
  });

  await test('GET /api/security/sharing/stats - Get sharing stats', async () => {
    const res = await makeRequest('GET', '/api/security/sharing/stats');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // Test 7: Web3 Identity
  console.log(`\n${colors.blue}[Web3 Identity]${colors.reset}`);
  await test('POST /api/security/identity/create - Create identity', async () => {
    const res = await makeRequest('POST', '/api/security/identity/create', {
      userData: {
        name: 'Test User',
        email: 'test@example.com'
      }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.identityId, 'Should return identity ID');
  });

  await test('GET /api/security/identity - Get all identities', async () => {
    const res = await makeRequest('GET', '/api/security/identity');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Should return array of identities');
  });

  await test('GET /api/security/identity/stats - Get identity stats', async () => {
    const res = await makeRequest('GET', '/api/security/identity/stats');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // Test 8: Security Alerts
  console.log(`\n${colors.blue}[Security Alerts]${colors.reset}`);
  await test('GET /api/security/alerts - Get security alerts', async () => {
    const res = await makeRequest('GET', '/api/security/alerts');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Should return array of alerts');
  });

  // Test 9: Authentication Routes (even though bypassed in frontend)
  console.log(`\n${colors.blue}[Authentication]${colors.reset}`);
  await test('POST /api/auth/register - Register new user', async () => {
    const res = await makeRequest('POST', '/api/auth/register', {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'SecurePass123!'
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.token, 'Should return JWT token');
  });

  await test('POST /api/auth/login - Login user', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'testuser@example.com',
      password: 'SecurePass123!'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Should return JWT token');
  });

  // Test 10: Static Files
  console.log(`\n${colors.blue}[Static Files]${colors.reset}`);
  await test('GET / - Serve index.html', async () => {
    const res = await makeRequest('GET', '/');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.headers['content-type'].includes('html'), 'Should return HTML');
  });

  // Print summary
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}Uncaught Exception:${colors.reset}`, error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`${colors.red}Unhandled Rejection:${colors.reset}`, reason);
  process.exit(1);
});

// Run tests
runTests();
