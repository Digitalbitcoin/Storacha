// server.js - UPDATED WITH BETTER ERROR HANDLING
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import * as Client from '@storacha/client';
import { StoreMemory } from '@storacha/client/stores/memory';
import * as Proof from '@storacha/client/proof';
import { Signer } from '@storacha/client/principal/ed25519';
import * as DID from '@ipld/dag-ucan/did';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist in production
const isProduction = process.env.NODE_ENV === 'production';

// CORS for development
if (!isProduction) {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Parse JSON bodies
app.use(express.json());

// Initialize Storacha client
let storachaClient = null;

// Helper to clean and validate base64
function cleanBase64(input) {
  if (!input) return null;
  
  // Remove whitespace and newlines
  let cleaned = input.trim().replace(/\s/g, '');
  
  // Remove any non-base64 characters
  cleaned = cleaned.replace(/[^A-Za-z0-9+/=]/g, '');
  
  // Add padding if needed
  while (cleaned.length % 4 !== 0) {
    cleaned += '=';
  }
  
  return cleaned;
}

async function initializeStoracha() {
  try {
    const privateKey = process.env.STORACHA_PRIVATE_KEY;
    const proofString = process.env.STORACHA_PROOF;

    if (!privateKey || !proofString) {
      console.error('ERROR: STORACHA_PRIVATE_KEY and STORACHA_PROOF must be set in .env file');
      console.error('\n=== HOW TO GET THESE VALUES ===');
      console.error('1. Install Storacha CLI: npm install -g @storacha/cli');
      console.error('2. Login: storacha login your-email@example.com');
      console.error('3. Create a key: storacha key create');
      console.error('   -> Save the PRIVATE KEY (starts with "Mg...") as STORACHA_PRIVATE_KEY');
      console.error('4. Get your agent DID from the key create output');
      console.error('5. Create delegation: storacha delegation create <your-agent-did> --base64');
      console.error('   -> Save the BASE64 OUTPUT as STORACHA_PROOF');
      console.error('================================\n');
      return false;
    }

    console.log('Initializing Storacha backend...');
    console.log('Private key length:', privateKey.length);
    console.log('Proof string length:', proofString.length);
    
    // Clean the inputs
    const cleanedPrivateKey = cleanBase64(privateKey);
    const cleanedProofString = cleanBase64(proofString);
    
    console.log('Cleaned private key length:', cleanedPrivateKey?.length);
    console.log('Cleaned proof length:', cleanedProofString?.length);
    
    if (!cleanedPrivateKey || !cleanedProofString) {
      console.error('ERROR: Failed to clean base64 inputs');
      return false;
    }

    // Try to parse the private key
    console.log('Attempting to parse private key...');
    const principal = Signer.parse(cleanedPrivateKey);
    console.log('✅ Private key parsed successfully');
    
    const store = new StoreMemory();
    storachaClient = await Client.create({ principal, store });
    console.log('✅ Storacha client created');

    // Try to parse the proof
    console.log('Attempting to parse proof...');
    const proof = await Proof.parse(cleanedProofString);
    console.log('✅ Proof parsed successfully');
    
    const space = await storachaClient.addSpace(proof);
    await storachaClient.setCurrentSpace(space.did());

    console.log(`✅ Storacha initialized for space: ${space.did()}`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize Storacha:', error.message);
    console.error('Error details:', error);
    
    // Provide specific troubleshooting
    if (error.message.includes('Non-base64pad character')) {
      console.error('\n=== TROUBLESHOOTING BASE64 ERROR ===');
      console.error('1. Check your STORACHA_PRIVATE_KEY format:');
      console.error('   - It should start with "Mg"');
      console.error('   - It should be a single line with no spaces');
      console.error('   - Example: Mg1234567890abcdef...');
      console.error('2. Check your STORACHA_PROOF format:');
      console.error('   - It should be a long base64 string');
      console.error('   - No line breaks or special characters');
      console.error('3. Try regenerating your credentials:');
      console.error('   - Run: storacha key create (again)');
      console.error('   - Run: storacha delegation create <new-did> --base64');
      console.error('======================================\n');
    }
    
    return false;
  }
}

// Test endpoint to check environment variables (without exposing them)
app.get('/api/env-check', (req, res) => {
  const hasPrivateKey = !!process.env.STORACHA_PRIVATE_KEY;
  const hasProof = !!process.env.STORACHA_PROOF;
  
  res.json({
    hasPrivateKey,
    hasProof,
    privateKeyLength: hasPrivateKey ? process.env.STORACHA_PRIVATE_KEY.length : 0,
    proofLength: hasProof ? process.env.STORACHA_PROOF.length : 0,
    privateKeyStartsWith: hasPrivateKey ? process.env.STORACHA_PRIVATE_KEY.substring(0, 20) + '...' : 'N/A',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    storacha: !!storachaClient,
    timestamp: new Date().toISOString()
  });
});

// Get delegation endpoint
app.get('/api/delegation/:did', async (req, res) => {
  try {
    if (!storachaClient) {
      const initialized = await initializeStoracha();
      if (!initialized) {
        return res.status(500).json({ 
          success: false,
          error: 'Storacha backend not configured properly. Check server logs.' 
        });
      }
    }

    const userDid = req.params.did;
    
    if (!userDid.startsWith('did:')) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid DID format. Must start with "did:"' 
      });
    }

    console.log(`Creating delegation for: ${userDid}`);

    const audience = DID.parse(userDid);
    const delegation = await storachaClient.createDelegation(audience, [
      'space/blob/add',
      'space/index/add',
      'filecoin/offer',
      'upload/add'
    ], {
      expiration: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    });

    const archive = await delegation.archive();
    if (!archive.ok) {
      throw new Error('Failed to create delegation archive');
    }

    const space = storachaClient.currentSpace();

    res.json({
      success: true,
      delegation: Buffer.from(archive.ok).toString('base64'),
      expiresAt: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      spaceDid: space?.did(),
      spaceName: 'My Storage Space'
    });

  } catch (error) {
    console.error('Delegation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create delegation' 
    });
  }
});

// Test setup endpoint
app.get('/api/test-setup', async (req, res) => {
  try {
    const result = await initializeStoracha();
    
    res.json({
      success: result,
      message: result ? 'Storacha initialized successfully' : 'Failed to initialize Storacha',
      hasClient: !!storachaClient
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test without Storacha
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// In production, serve React app
if (isProduction) {
  const distPath = join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  if (!isProduction) {
    console.log(`⚡ Vite dev server will run on http://localhost:5173`);
    console.log(`📁 Backend API: http://localhost:${PORT}/api`);
  }
  
  console.log('\n=== Checking Storacha Configuration ===');
  const hasPrivateKey = !!process.env.STORACHA_PRIVATE_KEY;
  const hasProof = !!process.env.STORACHA_PROOF;
  
  if (!hasPrivateKey || !hasProof) {
    console.error('❌ Missing Storacha credentials in .env file');
    console.error('   STORACHA_PRIVATE_KEY:', hasPrivateKey ? '✓ Set' : '✗ Missing');
    console.error('   STORACHA_PROOF:', hasProof ? '✓ Set' : '✗ Missing');
    console.error('\nRun these commands to set up:');
    console.error('1. npm install -g @storacha/cli');
    console.error('2. storacha login your-email@example.com');
    console.error('3. storacha key create');
    console.error('4. storacha delegation create <agent-did> --base64');
  } else {
    console.log('✅ Environment variables found');
    console.log('   Attempting to initialize Storacha...');
    
    // Don't initialize automatically - let it happen on first request
    // This gives you time to check /api/env-check first
    console.log('   Visit http://localhost:' + PORT + '/api/env-check to verify credentials');
    console.log('   Visit http://localhost:' + PORT + '/api/test-setup to initialize Storacha');
  }
  console.log('=====================================\n');
});
