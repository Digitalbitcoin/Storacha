// src/lib/api.ts
import { Buffer } from 'buffer';

// Ensure Buffer is available globally for the Storacha client
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export interface DelegationResponse {
  success: boolean;
  delegation: string;
  expiresAt: number;
  spaceDid: string;
  spaceName?: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  storacha: boolean;
  timestamp: string;
}

export interface TestResponse {
  message: string;
  storachaReady: boolean;
  env: {
    hasPrivateKey: boolean;
    hasProof: boolean;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * API client for communicating with the Storacha backend
 */
class StorachaAPI {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * Make a request to the API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(
          data.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  /**
   * Check if the backend is healthy and configured
   */
  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/health');
  }

  /**
   * Test endpoint for debugging
   */
  async testBackend(): Promise<TestResponse> {
    return this.request<TestResponse>('/api/test');
  }

  /**
   * Get a delegation for the given DID
   */
  async getDelegation(did: string): Promise<DelegationResponse> {
    return this.request<DelegationResponse>(`/api/delegation/${encodeURIComponent(did)}`);
  }

  /**
   * Get delegation with retry logic
   */
  async getDelegationWithRetry(
    did: string,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<DelegationResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, delay * Math.pow(2, attempt - 1))
          );
          console.log(`Retrying delegation request (attempt ${attempt + 1}/${maxRetries})...`);
        }

        return await this.getDelegation(did);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof APIError) {
          if (error.status === 400) {
            throw error; // Bad request, no need to retry
          }
          if (error.status === 401 || error.status === 403) {
            throw error; // Auth errors, no need to retry
          }
        }

        if (attempt === maxRetries - 1) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Failed to get delegation after retries');
  }

  /**
   * Validate a DID before making a request
   */
  validateDID(did: string): boolean {
    return did.startsWith('did:') && did.length > 10;
  }
}

// Create a singleton instance
export const api = new StorachaAPI();

// Export helper functions
export const storage = {
  /**
   * Save delegation data to localStorage
   */
  saveDelegation(delegation: DelegationResponse): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('storacha_delegation', JSON.stringify({
      token: delegation.delegation,
      expiresAt: delegation.expiresAt,
      spaceDid: delegation.spaceDid,
      spaceName: delegation.spaceName,
      timestamp: Date.now(),
    }));
  },

  /**
   * Load delegation data from localStorage
   */
  loadDelegation(): {
    token: string;
    expiresAt: number;
    spaceDid: string;
    spaceName?: string;
    timestamp: number;
  } | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('storacha_delegation');
    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      
      // Check if delegation is still valid (not expired)
      const now = Math.floor(Date.now() / 1000);
      if (data.expiresAt < now) {
        this.clearDelegation();
        return null;
      }

      return data;
    } catch {
      this.clearDelegation();
      return null;
    }
  },

  /**
   * Check if a valid delegation exists in localStorage
   */
  hasValidDelegation(): boolean {
    const delegation = this.loadDelegation();
    if (!delegation) return false;

    const now = Math.floor(Date.now() / 1000);
    const buffer = 300; // 5 minute buffer before expiry
    return delegation.expiresAt > now + buffer;
  },

  /**
   * Clear delegation data from localStorage
   */
  clearDelegation(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('storacha_delegation');
    localStorage.removeItem('storacha_space_info');
  },

  /**
   * Save space information
   */
  saveSpaceInfo(spaceDid: string, spaceName?: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('storacha_space_info', JSON.stringify({
      did: spaceDid,
      name: spaceName,
      lastUsed: Date.now(),
    }));
  },

  /**
   * Load space information
   */
  loadSpaceInfo(): { did: string; name?: string; lastUsed: number } | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('storacha_space_info');
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Clear all Storacha-related data
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('storacha_delegation');
    localStorage.removeItem('storacha_space_info');
    localStorage.removeItem('storacha_client_state');
  },
};

// Utility functions
export const utils = {
  /**
   * Format file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Generate a random string for nonce/challenge
   */
  generateNonce(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  },

  /**
   * Clean and extract CID from any string
   */
  extractCID(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove common prefixes and suffixes
    return input
      .replace(/^(ipfs:\/\/|https?:\/\/)/, '') // Remove ipfs:// or http:// prefixes
      .replace(/\.ipfs\.[^\/]+/, '') // Remove .ipfs.dweb.link etc
      .replace(/^\/ipfs\//, '') // Remove /ipfs/ prefix
      .split('/')[0]; // Get just the CID part, ignore paths
  },

  /**
   * Validate if a string is a valid CID with proper regex patterns
   */
  isValidCID(cid: string): boolean {
    if (!cid || typeof cid !== 'string') {
      return false;
    }

    // Clean the CID first
    const cleanCID = this.extractCID(cid);
    
    if (!cleanCID) {
      return false;
    }

    // CID v0 (Qm...): starts with Qm, 46 characters, base58btc
    // Qm followed by 44 base58 characters = 46 total
    if (cleanCID.startsWith('Qm') && cleanCID.length === 46) {
      // Base58btc alphabet: [1-9A-HJ-NP-Za-km-z]
      return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cleanCID);
    }

    // CID v1 base32 (b...): base32 encoding
    // Base32 alphabet: [a-z][2-7]
    if (cleanCID.startsWith('b')) {
      return /^b[a-z2-7]+$/.test(cleanCID) && cleanCID.length >= 59; // Minimum length for v1 base32
    }

    // CID v1 base58btc (z...)
    if (cleanCID.startsWith('z')) {
      // z + multibase base58btc encoding
      return /^z[1-9A-HJ-NP-Za-km-z]+$/.test(cleanCID) && cleanCID.length >= 46;
    }

    // CID v1 base16 (f...): hexadecimal
    if (cleanCID.startsWith('f')) {
      return /^f[0-9a-f]+$/.test(cleanCID);
    }

    // CID v1 base36 (v...): alphanumeric
    if (cleanCID.startsWith('v')) {
      return /^v[0-9a-z]+$/.test(cleanCID);
    }

    // CID v1 base10 (t...): decimal
    if (cleanCID.startsWith('t')) {
      return /^t[0-9]+$/.test(cleanCID);
    }

    // CID v1 base64 (m... or M...)
    if (cleanCID.startsWith('m') || cleanCID.startsWith('M')) {
      // Base64 alphabet: A-Za-z0-9+/ with optional padding =
      return /^[mM][A-Za-z0-9+/]+={0,2}$/.test(cleanCID);
    }

    // Additional common CID v1 prefixes
    const commonPrefixes = ['k', 'K', 'h', 'H', '9'];
    if (commonPrefixes.includes(cleanCID[0])) {
      return cleanCID.length > 30;
    }

    // For unknown patterns, do a generic check
    // Minimum reasonable CID length is about 30 characters
    if (cleanCID.length < 30) {
      return false;
    }

    // Check for common CID characters
    // Most CIDs use base32, base58, or base64 characters
    return /^[a-zA-Z0-9_\-\.]+$/.test(cleanCID);
  },

  /**
   * Create a gateway URL from a CID
   */
  createGatewayURL(cid: string, filename?: string, gateway: string = 'dweb.link'): string {
    const cleanCID = this.extractCID(cid);
    if (!this.isValidCID(cleanCID)) {
      throw new Error(`Invalid CID: ${cid}`);
    }

    let url = `https://${cleanCID}.ipfs.${gateway}`;
    
    if (filename) {
      // Ensure filename is properly encoded and doesn't start with /
      const cleanFilename = filename.replace(/^\//, '');
      url += `/${encodeURIComponent(cleanFilename)}`;
    }
    
    return url;
  },

  /**
   * Create an IPFS URL from a CID
   */
  createIPFSURL(cid: string, filename?: string): string {
    const cleanCID = this.extractCID(cid);
    if (!this.isValidCID(cleanCID)) {
      throw new Error(`Invalid CID: ${cid}`);
    }

    let url = `ipfs://${cleanCID}`;
    
    if (filename) {
      const cleanFilename = filename.replace(/^\//, '');
      url += `/${encodeURIComponent(cleanFilename)}`;
    }
    
    return url;
  },

  /**
   * Create multiple gateway URLs for redundancy
   */
  createGatewayURLs(cid: string, filename?: string): string[] {
    const cleanCID = this.extractCID(cid);
    if (!this.isValidCID(cleanCID)) {
      return [];
    }

    const gateways = [
      'dweb.link',
      'w3s.link',
      'ipfs.io',
      'cloudflare-ipfs.com',
      'gateway.pinata.cloud'
    ];

    return gateways.map(gateway => {
      let url = `https://${cleanCID}.ipfs.${gateway}`;
      if (filename) {
        const cleanFilename = filename.replace(/^\//, '');
        url += `/${encodeURIComponent(cleanFilename)}`;
      }
      return url;
    });
  },

  /**
   * Extract filename from a URL or path
   */
  extractFilename(path: string): string {
    if (!path) return '';
    
    // Remove query parameters and fragments
    const withoutQuery = path.split('?')[0];
    
    // Get the last segment
    const segments = withoutQuery.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // Decode URI encoding
    try {
      return decodeURIComponent(lastSegment);
    } catch {
      return lastSegment;
    }
  },

  /**
   * Check if CID is a directory (has subpaths)
   */
  isCIDDirectory(cidWithPath: string): boolean {
    const cleanPath = cidWithPath.replace(/^(ipfs:\/\/|https?:\/\/)/, '');
    return cleanPath.split('/').length > 1;
  },

  /**
   * Convert bytes to human-readable format with proper units
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Generate a unique ID
   */
  generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}${timestamp}-${random}`;
  },

  /**
   * Delay execution for a specified time
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Debounce function
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          () => resolve(true),
          () => resolve(false)
        );
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          resolve(successful);
        } catch {
          document.body.removeChild(textArea);
          resolve(false);
        }
      }
    });
  },

  /**
   * Download a file from a URL
   */
  downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Create a blob URL from data
   */
  createBlobURL(data: string | ArrayBuffer, type: string = 'application/octet-stream'): string {
    const blob = new Blob([data], { type });
    return URL.createObjectURL(blob);
  },

  /**
   * Revoke a blob URL to free memory
   */
  revokeBlobURL(url: string): void {
    URL.revokeObjectURL(url);
  },

  /**
   * Format date to readable string
   */
  formatDate(date: Date | string | number): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },

  /**
   * Get time ago string from date
   */
  getTimeAgo(date: Date | string | number): string {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'just now';
  },
};

// Export types
export type {
  DelegationResponse as DelegationResponseType,
  HealthResponse as HealthResponseType,
  TestResponse as TestResponseType,
  UploadProgress as UploadProgressType,
};

// Default export
export default api;
