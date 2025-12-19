# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. "command not found: node"
**Problem:** Node.js is not installed or not in PATH.

**Solutions:**
- **Windows:** Reinstall Node.js, check "Add to PATH" during installation
- **macOS/Linux:** 
  ```bash
  # Check if installed
  which node
  
  # Install via package manager
  # macOS:
  brew install node
  
  # Ubuntu/Debian:
  sudo apt update
  sudo apt install nodejs
