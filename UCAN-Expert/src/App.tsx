// src/App.tsx
import { useState, useEffect } from 'react';
import Uploader from './components/Uploader';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [backendUrl, setBackendUrl] = useState('http://localhost:3000');
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [showBackendControls, setShowBackendControls] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setIsCheckingBackend(true);
    try {
      const response = await fetch(`${backendUrl}/api/health`);
      const data = await response.json();
      setBackendStatus(data.storacha ? 'ready' : 'error');
    } catch (error) {
      console.error('Cannot reach backend:', error);
      setBackendStatus('error');
    } finally {
      setIsCheckingBackend(false);
    }
  };

  const getBackendStatusText = () => {
    switch (backendStatus) {
      case 'ready': return '✅ Ready';
      case 'error': return '❌ Not running';
      default: return '⏳ Checking...';
    }
  };

  const handleStartBackendInstructions = () => {
    alert(`To start the backend server:
    
1. Open a new terminal
2. Navigate to your project folder
3. Run: node server.js
4. Wait for "🚀 Server running on http://localhost:3000"
    
The backend provides delegation and storage access.`);
  };

  const handleViewBackendAPI = () => {
    window.open(`${backendUrl}/api/health`, '_blank');
  };

  const handleRetryConnection = () => {
    checkBackendHealth();
  };

  const handleChangeBackendUrl = () => {
    const newUrl = prompt('Enter backend URL:', backendUrl);
    if (newUrl && newUrl !== backendUrl) {
      setBackendUrl(newUrl);
      setTimeout(() => checkBackendHealth(), 500);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📁 Storacha Upload</h1>
        <p>Upload files to decentralized IPFS storage</p>
        
        {/* Backend Status Bar */}
        <div className="backend-status-bar">
          <div className="backend-status">
            <span>Backend Status:</span>
            <strong className={`status-${backendStatus}`}>
              {isCheckingBackend ? '🔄 Checking...' : getBackendStatusText()}
            </strong>
          </div>
          
          <div className="backend-controls">
            <button 
              onClick={handleRetryConnection}
              disabled={isCheckingBackend}
              className="backend-btn refresh-btn"
              title="Check backend status"
            >
              🔄
            </button>
            
            <button 
              onClick={() => setShowBackendControls(!showBackendControls)}
              className="backend-btn toggle-btn"
              title="Show backend controls"
            >
              {showBackendControls ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Backend Controls Panel */}
        {showBackendControls && (
          <div className="backend-panel">
            <div className="backend-info">
              <p>
                <strong>Backend URL:</strong> {backendUrl}
              </p>
              <p className="info-text">
                The backend server provides delegation tokens for Storacha access.
                It must be running for the uploader to work.
              </p>
            </div>
            
            <div className="backend-actions">
              <button 
                onClick={handleStartBackendInstructions}
                className="action-btn start-btn"
              >
                📋 How to Start Backend
              </button>
              
              <button 
                onClick={handleViewBackendAPI}
                className="action-btn api-btn"
                disabled={backendStatus !== 'ready'}
              >
                🔗 View API
              </button>
              
              <button 
                onClick={handleChangeBackendUrl}
                className="action-btn config-btn"
              >
                ⚙️ Change URL
              </button>
            </div>
            
            {backendStatus === 'error' && (
              <div className="backend-error">
                <p>⚠️ Cannot connect to backend at {backendUrl}</p>
                <p className="error-details">
                  Make sure you have started the backend server:
                  <code>node server.js</code>
                </p>
              </div>
            )}
          </div>
        )}
      </header>
      
      <main>
        {backendStatus === 'ready' ? (
          <Uploader />
        ) : (
          <div className="backend-required">
            <div className="required-message">
              <h2>🚨 Backend Required</h2>
              <p>The Storacha backend server is not running.</p>
              <p>You need to start it before you can upload files.</p>
              
              <div className="instructions">
                <h3>How to start:</h3>
                <ol>
                  <li>Open a terminal in your project folder</li>
                  <li>Run the command: <code>node server.js</code></li>
                  <li>Wait for the message: "🚀 Server running on {backendUrl}"</li>
                  <li>Click "Refresh" button above to check connection</li>
                </ol>
              </div>
              
              <div className="quick-commands">
                <h3>Initialize Storacha:</h3>
                <div className="command-list">
                  <div className="command">
                    <span>Verify Credentials:</span>
                    <code>curl {backendUrl}/api/env-check</code>
                  </div>
                  <div className="command">
                    <span>Initialize Client:</span>
                    <code>curl {backendUrl}/api/test-setup</code>
                  </div>
                </div>
              </div>

              <div className="quick-commands">
                <h3>Quick Commands:</h3>
                <div className="command-list">
                  <div className="command">
                    <span>Check backend:</span>
                    <code>curl {backendUrl}/api/health</code>
                  </div>
                  <div className="command">
                    <span>Test API:</span>
                    <code>curl {backendUrl}/api/test</code>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleRetryConnection}
                className="check-btn"
              >
                🔄 Check Connection Again
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p>
          All uploads are public and permanent. 
          Do not upload sensitive information.
        </p>
        <p className="footer-info">
          Backend: {backendUrl} • 
          Status: {getBackendStatusText().replace(/[✅❌⏳🔄]/g, '')}
        </p>
      </footer>

<style>{`
  .app {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header {
    text-align: center;
    color: white;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 10px 30px rgba(229, 62, 62, 0.3);
    position: relative;
    overflow: hidden;
  }

  .header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    animation: shimmer 3s infinite linear;
    pointer-events: none;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .header h1 {
    font-size: 2.75rem;
    margin-bottom: 0.75rem;
    font-weight: 800;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 1;
  }

  .header p {
    font-size: 1.2rem;
    opacity: 0.95;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  .backend-status-bar {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    padding: 1.25rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.25);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .backend-status-bar:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 25px rgba(229, 62, 62, 0.2);
  }

  .backend-status {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.15rem;
  }

  .backend-status span {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  .backend-status strong {
    font-weight: 600;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    min-width: 120px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .backend-controls {
    display: flex;
    gap: 0.75rem;
  }

  .backend-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .backend-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .backend-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
       box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
  }

  .backend-btn:hover:not(:disabled)::before {
    left: 100%;
  }

  .backend-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .backend-panel {
    background: linear-gradient(135deg, rgba(255, 245, 245, 0.98) 0%, rgba(254, 215, 215, 0.98) 100%);
    backdrop-filter: blur(20px);
    border-radius: 14px;
    padding: 2rem;
    margin-top: 1.5rem;
    border: 1px solid rgba(229, 62, 62, 0.2);
    box-shadow: 0 8px 32px rgba(229, 62, 62, 0.15);
    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .backend-info {
    margin-bottom: 2rem;
  }

  .backend-info p {
    color: #4a5568;
    margin: 0.75rem 0;
    line-height: 1.6;
  }

  .backend-info strong {
    color: #2d3748;
    font-weight: 600;
  }

  .info-text {
    color: #718096 !important;
    font-size: 1rem;
    line-height: 1.7;
    margin-top: 1rem !important;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #e53e3e;
  }

  .backend-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .action-btn {
    flex: 1;
    min-width: 220px;
    padding: 1rem 2rem;
    border-radius: 10px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    font-size: 1rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .action-btn:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .action-btn:hover:not(:disabled)::before {
    left: 100%;
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  .start-btn {
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
  }

  .api-btn {
    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
    color: white;
  }

  .config-btn {
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    color: white;
  }

  .backend-error {
    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
    border: 1px solid #feb2b2;
    border-radius: 10px;
    padding: 1.5rem;
    color: #c53030;
    border-left: 4px solid #e53e3e;
  }

  .backend-error p {
    margin: 0.75rem 0;
    line-height: 1.5;
  }

  .error-details {
    font-size: 0.95rem;
    margin-top: 1rem !important;
  }

  .error-details code {
    display: block;
    background: #fed7d7;
    padding: 1rem;
    border-radius: 6px;
    margin-top: 0.75rem;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.9rem;
    color: #9b2c2c;
    border: 1px solid #feb2b2;
  }

  .backend-required {
    background: white;
    border-radius: 16px;
    padding: 3.5rem;
    box-shadow: 0 20px 60px rgba(229, 62, 62, 0.15);
    margin: 1.5rem 0;
    text-align: center;
    border: 1px solid #fed7d7;
    position: relative;
    overflow: hidden;
  }

  .backend-required::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #e53e3e 0%, #c53030 100%);
  }

  .required-message {
    max-width: 650px;
    margin: 0 auto;
  }

  .required-message h2 {
    color: #e53e3e;
    margin-bottom: 1.25rem;
    font-size: 2.25rem;
    font-weight: 700;
    position: relative;
    display: inline-block;
  }

  .required-message h2::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #e53e3e 0%, #c53030 100%);
    border-radius: 2px;
  }

  .required-message p {
    color: #718096;
    margin-bottom: 0.75rem;
    font-size: 1.15rem;
    line-height: 1.6;
  }

  .instructions {
    background: #fff5f5;
    border-radius: 12px;
    padding: 2rem;
    margin: 2.5rem 0;
    text-align: left;
    border: 1px solid #fed7d7;
    position: relative;
  }

  .instructions h3 {
    color: #2d3748;
    margin-bottom: 1.25rem;
    text-align: center;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .instructions ol {
    margin: 0;
    padding-left: 1.75rem;
    color: #4a5568;
  }

  .instructions li {
    margin: 1rem 0;
    line-height: 1.6;
    padding-left: 0.5rem;
    position: relative;
  }

  .instructions li::before {
    content: '';
    position: absolute;
    left: -1.75rem;
    top: 0.75rem;
    width: 8px;
    height: 8px;
    background: #e53e3e;
    border-radius: 50%;
  }

  .instructions code {
    background: #fed7d7;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.9rem;
    margin: 0 0.25rem;
    color: #c53030;
    border: 1px solid #feb2b2;
  }

  .quick-commands {
    background: #fff5f5;
    border-radius: 12px;
    padding: 2rem;
    margin: 2.5rem 0;
    border: 1px solid #fed7d7;
  }

  .quick-commands h3 {
    color: #2d3748;
    margin-bottom: 1.25rem;
    text-align: center;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .command-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .command {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: white;
    padding: 1.25rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .command:hover {
    border-color: #e53e3e;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(229, 62, 62, 0.1);
  }

  .command span {
    color: #2d3748;
    font-weight: 600;
    font-size: 1rem;
  }

  .command code {
    background: #f7fafc;
    padding: 1rem;
    border-radius: 6px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.95rem;
    color: #2d3748;
    word-break: break-all;
    border: 1px solid #e2e8f0;
  }

  .check-btn {
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
    border: none;
    padding: 1.25rem 2.5rem;
    border-radius: 10px;
    font-size: 1.15rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 2rem;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
    position: relative;
    overflow: hidden;
  }

  .check-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .check-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(229, 62, 62, 0.4);
  }

  .check-btn:hover::before {
    left: 100%;
  }

  .footer {
    margin-top: auto;
    padding-top: 2.5rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.95rem;
    position: relative;
    z-index: 1;
  }

  .footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  }

  .footer p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }

  .footer-info {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7) !important;
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .app {
      width: 95%;
      padding: 0.75rem;
    }
    
    .header h1 {
      font-size: 2.25rem;
    }
    
    .header {
      padding: 2rem 1.5rem;
    }
    
    .backend-status-bar {
      flex-direction: column;
      gap: 1.25rem;
      text-align: center;
      padding: 1.5rem;
    }
    
    .backend-status {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .backend-controls {
      width: 100%;
      justify-content: center;
    }
    
    .backend-actions {
      flex-direction: column;
    }
    
    .action-btn {
      min-width: 100%;
    }
    
    .backend-required {
      padding: 2.5rem 1.5rem;
    }
    
    .required-message h2 {
      font-size: 1.75rem;
    }
    
    .footer-info {
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .header h1 {
      font-size: 1.875rem;
    }
    
    .header p {
      font-size: 1.05rem;
    }
    
    .backend-required {
      padding: 2rem 1rem;
    }
    
    .required-message h2 {
      font-size: 1.5rem;
    }
    
    .instructions,
    .quick-commands {
      padding: 1.5rem;
    }
  }
`}</style>
    </div>
  );
}

export default App;