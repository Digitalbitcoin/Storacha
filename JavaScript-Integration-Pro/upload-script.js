import { create } from '@storacha/client';

async function storachaIntegration() {
    console.log('🔧 Storacha JS Client Integration\n');
    
    // 1. Initialize client
    const client = await create();
    console.log('✅ Client initialized');
    
    // 2. Login (you'll need to verify via email)
    const account = await client.login('your-email@example.com');
    console.log('📧 Verification succesful');
    
    // 3. Create a simple test file
    const testFile = new File(
        ['# Storacha Integration Test\nUploaded via JS Client'],
        'test-file.md'
    );
    
    // 4. Upload to Storacha
    const cid = await client.uploadDirectory([testFile]);
    
    // 5. Output results
    console.log('\n🎯 Upload Complete!');
    console.log(`📎 CID: ${cid}`);
    console.log(`🔗 URL: https://${cid}.ipfs.storacha.link`);
    
    return cid;
}

// Execute

storachaIntegration().catch(console.error);
