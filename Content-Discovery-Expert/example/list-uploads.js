import { create } from '@storacha/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadAndListFiles() {
    console.log('🚀 Storacha: Upload and List Files');
    console.log('='.repeat(60));
    
    try {
        // 1. Create client (persistent environment)
        const client = await create();
        console.log('✅ Client created');
        
        // 2. Login with email
        const email = 'your-email@example.com'; // CHANGE THIS
        console.log(`📧 Logging in as: ${email}`);
        await client.login(email);
        console.log('✅ Login initiated - check your email for verification link');
        console.log('⚠️  For this demo, we assume verification is complete');
        
        // 3. Create multiple test files
        console.log('\n📁 Creating test files...');
        const testDir = path.join(__dirname, 'storacha-uploads');
        
        // Clean up previous test directory
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
        
        // Create directory structure
        fs.mkdirSync(testDir, { recursive: true });
        fs.mkdirSync(path.join(testDir, 'documents'), { recursive: true });
        fs.mkdirSync(path.join(testDir, 'images'), { recursive: true });
        
        // Create 10 different files
        const filesToCreate = [
            { path: 'readme.md', content: '# Welcome to Storacha\nThis is a test upload.' },
            { path: 'config.json', content: JSON.stringify({ project: 'test', version: '1.0.0' }, null, 2) },
            { path: 'documents/report.pdf.txt', content: 'PDF report placeholder' },
            { path: 'documents/notes.txt', content: 'Important notes here...' },
            { path: 'images/photo1.jpg.txt', content: 'Image 1 placeholder' },
            { path: 'images/photo2.jpg.txt', content: 'Image 2 placeholder' },
            { path: 'data.csv', content: 'name,value\ntest1,100\ntest2,200\n' },
            { path: 'scripts/hello.js', content: 'console.log("Hello Storacha!");' },
            { path: 'scripts/utils.js', content: 'export function test() { return "test"; }' },
            { path: 'backup/data.bak', content: 'Backup data content' }
        ];
        
        const files = [];
        for (const fileInfo of filesToCreate) {
            const fullPath = path.join(testDir, fileInfo.path);
            const dirPath = path.dirname(fullPath);
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            
            // Write file
            fs.writeFileSync(fullPath, fileInfo.content);
            
            // Create File object for upload
            const content = fs.readFileSync(fullPath);
            const file = new File([content], fileInfo.path, {
                type: getMimeType(fileInfo.path),
                lastModified: Date.now()
            });
            
            files.push(file);
            console.log(`   ✓ ${fileInfo.path}`);
        }
        
        console.log(`✅ Created ${files.length} files in ${testDir}`);
        
        // 4. Upload using uploadDirectory()
        console.log('\n📤 Uploading files to Storacha...');
        console.log('   This may take a moment...');
        
        const uploadStart = Date.now();
        const directoryCid = await client.uploadDirectory(files);
        const uploadTime = Date.now() - uploadStart;
        
        console.log(`✅ Upload completed in ${uploadTime}ms`);
        console.log(`📎 Directory CID: ${directoryCid}`);
        console.log(`🌐 View at: https://${directoryCid}.ipfs.storacha.link`);
        
        // 5. List uploads using client.capability.upload.list()
        console.log('\n📋 Listing all uploads...');
        console.log('─'.repeat(40));
        
        const listResult = await client.capability.upload.list();
        const uploads = listResult.results || [];
        
        if (uploads.length > 0) {
            uploads.forEach((upload, index) => {
                console.log(`\n${index + 1}. ${upload.name || 'Unnamed'}`);
                if (upload.cid) console.log(`   CID: ${upload.cid}`);
                if (upload.size) {
                    const sizeMB = (upload.size / (1024 * 1024)).toFixed(2);
                    console.log(`   Size: ${sizeMB} MB`);
                }
                if (upload.createdAt) {
                    const date = new Date(upload.createdAt).toLocaleString();
                    console.log(`   Uploaded: ${date}`);
                }
            });
        } else {
            console.log('No uploads found.');
        }
        
        // 6. Show uploaded directory structure
        console.log('\n📁 Uploaded Directory Structure:');
        console.log('storacha-uploads/');
        console.log('├── readme.md');
        console.log('├── config.json');
        console.log('├── documents/');
        console.log('│   ├── report.pdf.txt');
        console.log('│   └── notes.txt');
        console.log('├── images/');
        console.log('│   ├── photo1.jpg.txt');
        console.log('│   └── photo2.jpg.txt');
        console.log('├── data.csv');
        console.log('├── scripts/');
        console.log('│   ├── hello.js');
        console.log('│   └── utils.js');
        console.log('└── backup/');
        console.log('    └── data.bak');
        
        // 7. Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('\n🧹 Cleaned up temporary files');
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Upload Successful!');
        console.log('='.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   • Files uploaded: ${files.length}`);
        console.log(`   • Upload time: ${uploadTime}ms`);
        console.log(`   • Total uploads in space: ${uploads.length}`);
        console.log(`   • Directory CID: ${directoryCid}`);
        console.log(`   • Gateway URL: https://${directoryCid}.ipfs.storacha.link`);
        
        console.log('\n🔗 Access individual files:');
        console.log(`   • https://${directoryCid}.ipfs.storacha.link/readme.md`);
        console.log(`   • https://${directoryCid}.ipfs.storacha.link/documents/notes.txt`);
        console.log(`   • https://${directoryCid}.ipfs.storacha.link/scripts/hello.js`);
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
    }
}

// Helper function to determine MIME type
function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.js': 'application/javascript',
        '.csv': 'text/csv',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.pdf': 'application/pdf'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Run the script
uploadAndListFiles();
