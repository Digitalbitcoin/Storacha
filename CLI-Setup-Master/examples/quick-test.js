// Quick test script for CLI Setup Master
// Run with: node quick-test.js

const { execSync } = require('child_process');

console.log('🔍 CLI Setup Master - Quick Test');
console.log('='.repeat(40));

function runCommand(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

// Test 1: Node.js version
console.log('\n1. Testing Node.js:');
const nodeVersion = runCommand('node --version');
console.log(`   Version: ${nodeVersion}`);
console.log(`   ✅ ${nodeVersion.startsWith('v18') || nodeVersion.startsWith('v19') || nodeVersion.startsWith('v20') ? 'PASS' : 'FAIL - Need v18+'}`);

// Test 2: npm version
console.log('\n2. Testing npm:');
const npmVersion = runCommand('npm --version');
const npmMajor = parseInt(npmVersion.split('.')[0]);
console.log(`   Version: ${npmVersion}`);
console.log(`   ✅ ${npmMajor >= 7 ? 'PASS' : 'FAIL - Need v7+'}`);

// Test 3: Storacha CLI
console.log('\n3. Testing Storacha CLI:');
const storachaVersion = runCommand('storacha --version');
console.log(`   Output: ${storachaVersion}`);
console.log(`   ✅ ${storachaVersion.includes('storacha') ? 'PASS' : 'FAIL - Not installed'}`);

console.log('\n' + '='.repeat(40));
console.log('📊 Test Summary:');
console.log(`   Node.js: ${nodeVersion}`);
console.log(`   npm: ${npmVersion}`);
console.log(`   Storacha: ${storachaVersion}`);

if (storachaVersion.includes('storacha')) {
    console.log('\n🎉 CLI Setup Master - ALL TESTS PASSED!');
    console.log('\n🚀 Next: Try running: storacha --help');
} else {
    console.log('\n❌ Some tests failed. Run ./verify-installation.sh for help.');
}
