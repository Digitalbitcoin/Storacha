# 🔍 Content Discovery Expert

Master content listing, analysis, and management in Storacha.

## 📋 Project Objective
Learn to list and manage your uploads effectively.

## ✅ Tasks Completed
1. ✅ Use CLI: `storacha ls` to list your uploads
2. ✅ Use CLI: `storacha ls --shards` to see CAR CIDs
3. ✅ Write a JS script using `client.capability.upload.list()`

## 🎯 Key Concepts
- **Root CID**: Top-level identifier for uploaded content
- **CAR CIDs**: Content-addressed archive shards
- **Upload Metadata**: Information about uploads (size, type, date)
- **Sharding**: How large files are split into manageable pieces

## 🚀 Quick Start

### CLI Commands
```bash
# List all uploads
storacha ls

# List with shard details
storacha ls --shards

# List with detailed information
storacha ls --verbose

# List in JSON format
storacha ls --json
