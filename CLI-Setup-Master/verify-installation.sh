```bash
#!/bin/bash

# CLI Setup Master - Installation Verification Script
# Run: bash verify-installation.sh

echo "========================================="
echo "🚀 Storacha CLI Setup Master - Verification"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Task 1: Verify Node.js and npm versions"
echo "-----------------------------------------"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ $NODE_MAJOR -ge 18 ]; then
        echo -e "${GREEN}✅ Node.js v$NODE_VERSION detected (≥ v18 required)${NC}"
    else
        echo -e "${RED}❌ Node.js v$NODE_VERSION detected (v18+ required)${NC}"
        echo "   Please update Node.js: https://nodejs.org"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "   Download from: https://nodejs.org"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    NPM_MAJOR=$(echo $NPM_VERSION | cut -d'.' -f1)
    
    if [ $NPM_MAJOR -ge 7 ]; then
        echo -e "${GREEN}✅ npm v$NPM_VERSION detected (≥ v7 required)${NC}"
    else
        echo -e "${YELLOW}⚠️ npm v$NPM_VERSION detected (v7+ recommended)${NC}"
        echo "   Updating npm..."
        npm install -g npm@latest
    fi
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

echo ""
echo "📦 Task 2: Check Storacha CLI Installation"
echo "-----------------------------------------"

# Check if storacha is installed
if command -v storacha &> /dev/null; then
    echo -e "${GREEN}✅ Storacha CLI is installed${NC}"
    
    # Get storacha version
    STORACHA_VERSION=$(storacha --version 2>/dev/null || echo "unknown")
    echo -e "   Version: $STORACHA_VERSION"
    
    # Check installation location
    STORACHA_PATH=$(which storacha)
    echo -e "   Location: $STORACHA_PATH"
else
    echo -e "${YELLOW}⚠️ Storacha CLI not found, installing...${NC}"
    
    # Install storacha
    echo "   Installing @storacha/client globally..."
    npm install -g @storacha/client
    
    if command -v storacha &> /dev/null; then
        echo -e "${GREEN}✅ Storacha CLI installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install Storacha CLI${NC}"
        echo "   Try manually: npm install -g @storacha/client"
        exit 1
    fi
fi

echo ""
echo "✅ Task 3: Final Verification"
echo "-----------------------------------------"

# Final test of storacha command
if storacha --version &> /dev/null; then
    echo -e "${GREEN}🎉 CLI Setup Master - ALL TASKS COMPLETED SUCCESSFULLY!${NC}"
    echo ""
    echo "📊 Summary:"
    echo "   Node.js: v$NODE_VERSION ✓"
    echo "   npm: v$NPM_VERSION ✓"
    echo "   Storacha: $(storacha --version) ✓"
    echo ""
    echo "🚀 Next Steps:"
    echo "   Run: storacha --help"
    echo "   Or: storacha init"
else
    echo -e "${RED}❌ Final verification failed${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Verification Complete!"
echo "========================================="
