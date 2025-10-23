#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  SecureShield Testing Script${NC}"
echo -e "${CYAN}========================================${NC}\n"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Kill any existing node processes on port 5000
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
sleep 1

# Start the server in background
echo -e "${YELLOW}Starting SecureShield server...${NC}"
node server.js > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo -e "${YELLOW}Waiting for server to initialize...${NC}"
sleep 3

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}Error: Server failed to start${NC}"
    echo -e "${RED}Server log:${NC}"
    cat server.log
    exit 1
fi

echo -e "${GREEN}Server started successfully (PID: $SERVER_PID)${NC}\n"

# Run the tests
echo -e "${BLUE}Running tests...${NC}\n"
node test-server.js

# Capture test exit code
TEST_EXIT_CODE=$?

# Cleanup: Kill the server
echo -e "\n${YELLOW}Cleaning up...${NC}"
kill $SERVER_PID 2>/dev/null || true
sleep 1

# Force kill if still running
if kill -0 $SERVER_PID 2>/dev/null; then
    kill -9 $SERVER_PID 2>/dev/null || true
fi

# Remove server log
rm -f server.log

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Some tests failed!${NC}"
fi

exit $TEST_EXIT_CODE
