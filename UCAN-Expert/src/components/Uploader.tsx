// src/components/Uploader.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStoracha } from '../hooks/useStoracha';

interface DelegationInput {
  key: string;
  proof: string;
  spaceDid: string;
}

const Uploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ready' | 'error' | 'not-configured'>('checking');
  const [setupStep, setSetupStep] = useState<'idle' | 'initializing' | 'getting-delegation' | 'ready'>('idle');
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [isActivatingSpace, setIsActivatingSpace] = useState(false);
  const [showDelegationForm, setShowDelegationForm] = useState(false);
  const [delegationInput, setDelegationInput] = useState<DelegationInput>({
    key: '',
    proof: '',
    spaceDid: ''
  });

  const {
    client,
    isInitializing,
    isUploading,
    error,
    spaceDid,
    initializeClient,
    setupDelegation,
    uploadFile,
    isReady,
    refreshSpaces,
    logout,
    userSession
  } = useStoracha();

  // Check backend health
  const checkBackend = useCallback(async () => {
    setIsCheckingBackend(true);
    setBackendStatus('checking');
    
    try {
      const response = await fetch('http://localhost:3000/api/health');
      const data = await response.json();
      setBackendStatus(data.storacha ? 'ready' : 'not-configured');
      console.log('Backend health:', data);
    } catch (error) {
      console.error('Cannot reach backend:', error);
      setBackendStatus('error');
    } finally {
      setIsCheckingBackend(false);
    }
  }, []);

  // Handle delegation setup
  const handleDelegationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!delegationInput.key || !delegationInput.proof) {
      alert('Please enter both key and proof');
      return;
    }

    setSetupStep('getting-delegation');
    
    const success = await setupDelegation({
      key: delegationInput.key,
      proof: delegationInput.proof,
      spaceDid: delegationInput.spaceDid || undefined
    });
    
    if (success) {
      setSetupStep('ready');
      setShowDelegationForm(false);
      setDelegationInput({ key: '', proof: '', spaceDid: '' });
    } else {
      setSetupStep('idle');
    }
  };

  // Initialize client only
  const handleInitializeClient = async () => {
    setSetupStep('initializing');
    await initializeClient();
    setSetupStep('idle');
    
    if (client && !spaceDid) {
      // Show delegation form after client initialization
      setShowDelegationForm(true);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setUploadResult(null);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
    setUploadResult(null);
  }, []);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      alert('Please select a file first');
      return;
    }

    const file = selectedFiles[0];
    const result = await uploadFile(file);
    
    setUploadResult(result);
    
    if (result.success) {
      alert(`✅ Uploaded successfully!\nCID: ${result.cid}`);
    } else {
      alert(`❌ Upload failed: ${result.error}`);
    }
  }, [selectedFiles, uploadFile]);

  // Clear everything
  const handleClear = () => {
    setSelectedFiles([]);
    setUploadResult(null);
  };

  // Create test file
  const createTestFile = () => {
    const content = `Storacha Test File
Created at: ${new Date().toISOString()}
This is a test file for Storacha upload demo.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], `test-${Date.now()}.txt`, {
      type: 'text/plain',
      lastModified: Date.now(),
    });
    
    setSelectedFiles([file]);
    setUploadResult(null);
  };

  // Activate space
  const handleActivateSpace = async () => {
    setIsActivatingSpace(true);
    
    try {
      await refreshSpaces();
      
      if (spaceDid) {
        const button = document.querySelector('.activate-space-btn');
        if (button) {
          button.innerHTML = '✅ Space Activated!';
          setTimeout(() => {
            setIsActivatingSpace(false);
          }, 1000);
        }
      } else {
        setIsActivatingSpace(false);
        alert('No spaces available. Please setup delegation first.');
      }
    } catch (error) {
      setIsActivatingSpace(false);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to activate space'}`);
    }
  };

  // Check backend on mount
  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  // Update setup step based on isReady
  useEffect(() => {
    if (isReady) {
      setSetupStep('ready');
    }
  }, [isReady]);

  const getBackendStatusText = () => {
    switch (backendStatus) {
      case 'ready': return '✅ Ready';
      case 'error': return '❌ Cannot connect';
      case 'not-configured': return '⚠️ Not configured';
      default: return '⏳ Checking...';
    }
  };

  const getClientStatusText = () => {
    if (isReady) return '✅ Ready';
    if (isInitializing) return '🔄 Initializing...';
    if (setupStep === 'getting-delegation') return '🔄 Getting permissions...';
    if (error) return '❌ Error';
    return '⏳ Not ready';
  };

  return (
    <div className="uploader">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span>Backend:</span>
          <strong>{getBackendStatusText()}</strong>
          {isCheckingBackend && <span className="mini-spinner"></span>}
        </div>
        <div className="status-item">
          <span>Client:</span>
          <strong>{getClientStatusText()}</strong>
          {(isInitializing || setupStep === 'getting-delegation') && (
            <span className="mini-spinner"></span>
          )}
        </div>
        {spaceDid && (
          <div className="status-item">
            <span>Space:</span>
            <code title={spaceDid}>{spaceDid.substring(0, 20)}...</code>
          </div>
        )}
        {userSession.isLoggedIn && (
          <div className="status-item">
            <span>User:</span>
            <strong>{userSession.email}</strong>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>

      {/* Setup Section */}
      {!isReady && backendStatus === 'ready' && (
        <div className="setup-section">
          <h2>Setup Storage Access</h2>
          <p>Initialize the client and provide delegation credentials</p>
          
          {!client ? (
            <button 
              onClick={handleInitializeClient}
              disabled={setupStep === 'initializing'}
              className="setup-button"
            >
              {setupStep === 'initializing' ? (
                <>
                  <span className="button-spinner"></span>
                  Initializing client...
                </>
              ) : (
                'Initialize Client'
              )}
            </button>
          ) : (
            <div className="client-ready">
              <p>✅ Client initialized successfully</p>
              <p>Agent DID: {client.agent?.did()?.substring(0, 30)}...</p>
              
              {!showDelegationForm ? (
                <button 
                  onClick={() => setShowDelegationForm(true)}
                  className="setup-button"
                >
                  Continue with Delegation
                </button>
              ) : (
                <div className="delegation-form">
                  <h3>Enter Delegation Credentials</h3>
                  <form onSubmit={handleDelegationSubmit}>
                    <div className="form-group">
                      <label>Private Key (base64, starts with "Mg"):</label>
                      <textarea
                        value={delegationInput.key}
                        onChange={(e) => setDelegationInput(prev => ({...prev, key: e.target.value}))}
                        placeholder="Enter your private key..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Delegation Proof (base64):</label>
                      <textarea
                        value={delegationInput.proof}
                        onChange={(e) => setDelegationInput(prev => ({...prev, proof: e.target.value}))}
                        placeholder="Enter delegation proof..."
                        rows={5}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Space DID (optional):</label>
                      <input
                        type="text"
                        value={delegationInput.spaceDid}
                        onChange={(e) => setDelegationInput(prev => ({...prev, spaceDid: e.target.value}))}
                        placeholder="did:key:..."
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={setupStep === 'getting-delegation'}
                      className="setup-button"
                    >
                      {setupStep === 'getting-delegation' ? (
                        <>
                          <span className="button-spinner"></span>
                          Setting up delegation...
                        </>
                      ) : (
                        'Setup Delegation'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
              <button 
                onClick={checkBackend}
                className="retry-button"
                disabled={isCheckingBackend}
              >
                {isCheckingBackend ? (
                  <>
                    <span className="mini-spinner"></span>
                    Retrying...
                  </>
                ) : (
                  'Retry Connection'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Space Status Section */}
      {isReady && spaceDid && (
        <div className="space-setup-section">
          <h3>✅ Space Ready!</h3>
          <div className="space-info">
            <p><strong>Active Space:</strong></p>
            <code className="space-did" title={spaceDid}>
              {spaceDid}
            </code>
            <p>You can now upload files to this storage space.</p>
          </div>
        </div>
      )}

      {client && !spaceDid && isReady && (
        <div className="space-warning">
          <h3>⚠️ Space Not Activated</h3>
          <p>Client is ready but no storage space is active.</p>
          <button 
            onClick={handleActivateSpace}
            disabled={isActivatingSpace}
            className={`activate-space-btn ${isActivatingSpace ? 'loading' : ''}`}
          >
            {isActivatingSpace ? (
              <>
                <span className="button-spinner"></span>
                Activating...
              </>
            ) : (
              '🔧 Activate Storage Space'
            )}
          </button>
        </div>
      )}

      {backendStatus === 'error' && (
        <div className="connection-error">
          <h3>⚠️ Cannot connect to backend</h3>
          <p>Make sure the backend server is running:</p>
          <code>node server.js</code>
          <p>Backend should be running on: http://localhost:3000</p>
          <button 
            onClick={checkBackend}
            disabled={isCheckingBackend}
          >
            {isCheckingBackend ? (
              <>
                <span className="mini-spinner"></span>
                Retrying...
              </>
            ) : (
              'Retry Connection'
            )}
          </button>
        </div>
      )}

      {backendStatus === 'not-configured' && (
        <div className="config-error">
          <h3>⚠️ Backend not configured</h3>
          <p>The backend server is running but Storacha is not configured.</p>
          <p>Check your .env file and server logs.</p>
          <button 
            onClick={checkBackend}
            disabled={isCheckingBackend}
            className="retry-button"
          >
            {isCheckingBackend ? (
              <>
                <span className="mini-spinner"></span>
                Checking...
              </>
            ) : (
              'Check Again'
            )}
          </button>
        </div>
      )}

      {/* Upload Section */}
      {isReady && backendStatus === 'ready' && (
        <div className="upload-section">
          <h2>Upload Files to Decentralized Storage</h2>
          
          <div 
            className="drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {selectedFiles.length === 0 ? (
              <>
                <div className="upload-icon">📁</div>
                <p>Drag & drop files here or click to browse</p>
                <p className="hint">Max size: 100MB • Supports multiple files</p>
                <div className="button-group">
                  <button 
                    className="browse-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Browse Files
                  </button>
                  <button 
                    className="test-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      createTestFile();
                    }}
                  >
                    Create Test File
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="file-info">
                  <div className="file-icon">📄</div>
                  <div>
                    <p className="filename">{selectedFiles[0].name}</p>
                    <p className="filesize">
                      {(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="file-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="add-button"
                  >
                    Add More
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="clear-button"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              multiple
              style={{ display: 'none' }}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className={`upload-button ${isUploading ? 'loading' : ''}`}
          >
            {isUploading ? (
              <>
                <span className="spinner"></span>
                Uploading to Storacha...
              </>
            ) : (
              `Upload ${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} to Storacha`
            )}
          </button>

          {uploadResult && (
            <div className={`result ${uploadResult.success ? 'success' : 'error'}`}>
              <h3>{uploadResult.success ? '✅ Upload Successful!' : '❌ Upload Failed'}</h3>
              
              {uploadResult.success && (
                <>
                  <div className="result-details">
                    <div className="detail-item">
                      <strong>File:</strong> {uploadResult.name}
                    </div>
                    <div className="detail-item">
                      <strong>Size:</strong> {(uploadResult.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div className="detail-item">
                      <strong>CID:</strong>
                      <code className="cid" title={uploadResult.cid}>
                        {uploadResult.cid}
                      </code>
                    </div>
                    <div className="detail-item">
                      <strong>Gateway URL:</strong>
                      <a 
                        href={uploadResult.gatewayUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="gateway-link"
                        title={uploadResult.gatewayUrl}
                      >
                        {uploadResult.gatewayUrl?.substring(0, 50)}...
                      </a>
                    </div>
                  </div>
                  
                  <div className="action-buttons">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(uploadResult.cid || '');
                        const button = document.querySelector('.copy-button');
                        if (button) {
                          const originalText = button.textContent;
                          button.innerHTML = '✅ Copied!';
                          setTimeout(() => {
                            button.textContent = originalText;
                          }, 2000);
                        }
                      }}
                      className="copy-button"
                    >
                      📋 Copy CID
                    </button>
                    <button
                      onClick={() => window.open(uploadResult.gatewayUrl, '_blank')}
                      className="view-button"
                    >
                      🔗 Open in Gateway
                    </button>
                  </div>
                </>
              )}
              
              {uploadResult.error && (
                <div className="error-details">
                  <p className="error-message">{uploadResult.error}</p>
                  <button
                    onClick={handleUpload}
                    className="retry-button"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="mini-spinner"></span>
                        Retrying...
                      </>
                    ) : (
                      '🔄 Retry Upload'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="info-section">
        <h3>ℹ️ How it works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Initialize Client</strong>
              <p>Create a Storacha client in your browser</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Setup Delegation</strong>
              <p>Provide your private key and delegation proof</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>Upload Files</strong>
              <p>Files are stored on IPFS with Filecoin persistence</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>Share & Access</strong>
              <p>Use the CID to access files from any IPFS gateway</p>
            </div>
          </div>
        </div>
        
        <div className="warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <strong>Important Notice:</strong>
            <ul>
              <li>Delegation setup requires valid credentials from backend</li>
              <li>All uploaded files are publicly accessible via CID</li>
              <li>Data is permanently stored on IPFS and Filecoin</li>
              <li>Do not upload sensitive or private information</li>
              <li>Storacha charges for storage (minimum 30 days)</li>
            </ul>
          </div>
        </div>
      </div>

<style>{`
  .uploader {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);          
    margin: 0 auto;
    max-width: 100%;
  }

  .status-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #fff5f5;
    border-radius: 8px;
    flex-wrap: wrap;
    border: 1px solid #fed7d7;
  }
  
  .status-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: white;
    border-radius: 6px;
    border: 1px solid #fed7d7;
    min-width: 200px;
  }

  .status-item span {
    color: #718096;
    font-weight: 500;
  }

  .status-item strong {
    color: #2d3748;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logout-btn {
    margin-left: auto;
    padding: 0.25rem 0.75rem;
    background: #e53e3e;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .logout-btn:hover {
    background: #c53030;
  }

  .mini-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(229, 62, 62, 0.3);
    border-radius: 50%;
    border-top-color: #e53e3e;
    animation: spin 1s linear infinite;
  }

  .button-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }

  .setup-section {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
    border-radius: 12px;
    margin: 1.5rem 0;
    border: 2px dashed #e53e3e;
  }

  .setup-section h2 {
    color: #c53030;
    margin-bottom: 0.5rem;
  }

  .setup-section p {
    color: #718096;
    margin-bottom: 1.5rem;
  }

  .setup-button {
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    min-width: 250px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(229, 62, 62, 0.2);
  }

  .setup-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
    box-shadow: 0 6px 20px rgba(229, 62, 62, 0.3);
  }

  .setup-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .client-ready {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 1px solid #fed7d7;
  }

  .delegation-form {
    text-align: left;
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #fed7d7;
  }

  .delegation-form h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #2d3748;
    border-bottom: 2px solid #e53e3e;
    padding-bottom: 0.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #4a5568;
  }

  .form-group textarea,
  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 0.9rem;
    resize: vertical;
    transition: border-color 0.2s;
  }

  .form-group textarea:focus,
  .form-group input:focus {
    outline: none;
    border-color: #e53e3e;
    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
  }

  .form-group textarea {
    min-height: 100px;
  }

  .space-setup-section {
    background: #f0fff4;
    border: 2px solid #38a169;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    text-align: center;
  }

  .space-setup-section h3 {
    color: #2f855a;
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .space-info {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    border: 1px solid #c6f6d5;
  }

  .space-did {
    display: block;
    background: #f7fafc;
    padding: 1rem;
    border-radius: 6px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 0.9rem;
    word-break: break-all;
    margin: 0.5rem 0;
    border: 1px solid #e2e8f0;
  }

  .space-warning {
    background: #fffaf0;
    border: 2px solid #ed8936;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    text-align: center;
  }

  .space-warning h3 {
    color: #dd6b20;
    margin-top: 0;
  }

  .activate-space-btn {
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 200px;
    box-shadow: 0 4px 12px rgba(237, 137, 54, 0.2);
  }

  .activate-space-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #dd6b20 0%, #c05621 100%);
    box-shadow: 0 6px 20px rgba(237, 137, 54, 0.3);
  }

  .connection-error, .config-error {
    background: #fff5f5;
    border: 2px solid #e53e3e;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    margin: 1.5rem 0;
  }

  .connection-error h3, .config-error h3 {
    color: #c53030;
    margin-bottom: 1rem;
  }

  .connection-error code, .config-error code {
    background: #fed7d7;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    display: block;
    margin: 1rem auto;
    max-width: 300px;
    font-family: monospace;
    color: #9b2c2c;
  }

  .upload-section {
    margin: 2rem 0;
  }

  .upload-section h2 {
    color: #2d3748;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .drop-zone {
    border: 3px dashed #fed7d7;
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    margin: 1.5rem 0;
    background: #fff5f5;
  }

  .drop-zone:hover {
    border-color: #e53e3e;
    background: #fed7d7;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(229, 62, 62, 0.1);
  }

  .upload-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.8;
    color: #e53e3e;
  }

  .hint {
    color: #a0aec0;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .browse-button, .test-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: 2px solid #e53e3e;
    background: white;
    color: #e53e3e;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .browse-button:hover, .test-button:hover {
    background: #e53e3e;
    color: white;
  }

  .test-button {
    border-color: #38a169;
    color: #38a169;
  }

  .test-button:hover {
    background: #38a169;
    color: white;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .file-icon {
    font-size: 2.5rem;
    color: #e53e3e;
  }

  .filename {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.25rem;
    font-size: 1.1rem;
  }

  .filesize {
    color: #718096;
    font-size: 0.9rem;
  }

  .file-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .add-button, .clear-button {
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-button {
    background: #e53e3e;
    color: white;
  }

  .add-button:hover {
    background: #c53030;
  }

  .clear-button {
    background: #718096;
    color: white;
  }

  .clear-button:hover {
    background: #4a5568;
  }

  .upload-button {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 4px 12px rgba(229, 62, 62, 0.2);
  }

  .upload-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 62, 62, 0.3);
  }

  .upload-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .result {
    margin-top: 2rem;
    padding: 2rem;
    border-radius: 12px;
    background: #f0fff4;
    border: 2px solid #38a169;
  }

  .result.error {
    background: #fff5f5;
    border-color: #e53e3e;
  }

  .result h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #2d3748;
  }

  .result-details {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border: 1px solid #e2e8f0;
  }

  .detail-item {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-item strong {
    color: #4a5568;
  }

  .cid {
    background: #f7fafc;
    padding: 0.75rem;
    border-radius: 6px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 0.9rem;
    word-break: break-all;
    cursor: text;
    border: 1px solid #e2e8f0;
  }

  .gateway-link {
    color: #e53e3e;
    text-decoration: none;
    word-break: break-all;
    display: block;
    padding: 0.75rem;
    background: #f7fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
  }

  .gateway-link:hover {
    background: #fed7d7;
    text-decoration: underline;
    color: #c53030;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .copy-button, .view-button, .retry-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .copy-button {
    background: #e53e3e;
    color: white;
  }

  .copy-button:hover {
    background: #c53030;
  }

  .view-button {
    background: #38a169;
    color: white;
  }

  .view-button:hover {
    background: #2f855a;
  }

  .retry-button {
    background: #ed8936;
    color: white;
  }

  .retry-button:hover {
    background: #dd6b20;
  }

  .error-details {
    text-align: center;
  }

  .error-message {
    color: #c53030;
    background: #fed7d7;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-family: monospace;
  }

  .info-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 2px solid #fed7d7;
  }

  .info-section h3 {
    color: #2d3748;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .step {
    text-align: center;
    padding: 1.5rem;
    background: #fff5f5;
    border-radius: 12px;
    border: 1px solid #fed7d7;
    transition: transform 0.3s;
  }

  .step:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(229, 62, 62, 0.1);
  }

  .step-number {
    width: 40px;
    height: 40px;
    background: #e53e3e;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin: 0 auto 1rem;
  }

  .step-content strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #2d3748;
  }

  .step-content p {
    color: #718096;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .warning {
    background: #fffaf0;
    border: 2px solid #ed8936;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .warning-icon {
    font-size: 1.5rem;
    color: #dd6b20;
  }

  .warning-content {
    flex: 1;
  }

  .warning-content strong {
    color: #c05621;
    display: block;
    margin-bottom: 0.5rem;
  }

  .warning-content ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #c05621;
  }

  .warning-content li {
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }

  /* Success/Error state colors */
  .success-color {
    color: #38a169;
  }

  .error-color {
    color: #e53e3e;
  }

  .warning-color {
    color: #ed8936;
  }

  /* Enhanced animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .pulse {
    animation: pulse 2s infinite;
  }
`}</style>
    </div>
  );
};

export default Uploader;
