// src/hooks/useStoracha.ts
import { useState, useCallback, useEffect } from 'react';
import { create } from '@storacha/client';
import { StoreMemory } from '@storacha/client/stores/memory';
import { Signer } from '@storacha/client/principal/ed25519';
import * as Proof from '@storacha/client/proof';

interface UploadResult {
  success: boolean;
  cid?: string;
  url?: string;
  size: number;
  name: string;
  error?: string;
  gatewayUrl?: string;
  file?: {
    id: string;
    name: string;
    type: string;
    size: number;
    cid: string;
    uploadedAt: Date;
    gatewayUrl: string;
    thumbnailUrl?: string;
    description?: string;
  };
}

interface DelegationConfig {
  key: string;
  proof: string;
  spaceDid?: string;
}

interface UserSession {
  email: string;
  isLoggedIn: boolean;
  method: 'email' | 'delegation' | null;
  spaceDid?: string;
  agentDid?: string;
}

interface UseStorachaReturn {
  client: any | null;
  space: any | null;
  spaceDid: string | null;
  isInitializing: boolean;
  isUploading: boolean;
  error: string | null;
  isReady: boolean;
  userSession: UserSession;
  initializeClient: () => Promise<string | null>;
  setupDelegation: (delegationConfig: DelegationConfig) => Promise<boolean>;
  uploadFile: (file: File) => Promise<UploadResult>;
  logout: () => void;
  refreshSpaces: () => Promise<void>;
}

const SESSION_KEY = 'storacha_session';

const cleanBase64 = (input: string): string => {
  return input.replace(/[^A-Za-z0-9+/=]/g, '').trim();
};

export function useStoracha(): UseStorachaReturn {
  const [client, setClient] = useState<any>(null);
  const [space, setSpace] = useState<any>(null);
  const [spaceDid, setSpaceDid] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : { 
      email: '', 
      isLoggedIn: false, 
      method: null,
      spaceDid: '',
      agentDid: ''
    };
  });

  const saveSession = useCallback((session: UserSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUserSession(session);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUserSession({ 
      email: '', 
      isLoggedIn: false, 
      method: null, 
      spaceDid: '', 
      agentDid: '' 
    });
  }, []);

  // Initialize client
  const initializeClient = useCallback(async (): Promise<string | null> => {
    setIsInitializing(true);
    setError(null);

    try {
      console.log('Initializing Storacha client...');
      const store = new StoreMemory();
      const storachaClient = await create({ store });
      
      setClient(storachaClient);
      const agentDid = storachaClient.agent.did();
      console.log('Client initialized with DID:', agentDid);
      
      // Check for existing spaces
      const spaces = await storachaClient.spaces();
      if (spaces && spaces.length > 0) {
        const space = spaces[0];
        await storachaClient.setCurrentSpace(space.did());
        setSpace(space);
        setSpaceDid(space.did());
        console.log('Existing space found and set:', space.did());
        
        const session: UserSession = {
          email: 'delegation@user',
          isLoggedIn: true,
          method: 'delegation',
          spaceDid: space.did(),
          agentDid
        };
        saveSession(session);
      }
      
      return agentDid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize';
      setError(errorMessage);
      console.error('Initialization error:', err);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [saveSession]);

  // Setup delegation - FIXED VERSION
  const setupDelegation = useCallback(async (delegationConfig: DelegationConfig): Promise<boolean> => {
    setIsInitializing(true);
    setError(null);

    try {
      console.log('Setting up delegation with config:', {
        keyLength: delegationConfig.key?.length,
        proofLength: delegationConfig.proof?.length,
        hasSpaceDid: !!delegationConfig.spaceDid
      });

      const cleanProof = cleanBase64(delegationConfig.proof);
      const cleanKey = delegationConfig.key.trim();

      if (!cleanProof || cleanProof.length < 100) {
        throw new Error('Invalid delegation proof. Proof too short or missing.');
      }

      if (!cleanKey || !cleanKey.startsWith('Mg')) {
        throw new Error('Invalid private key format. Should start with "Mg" and be base64 encoded.');
      }

      const principal = Signer.parse(cleanKey);
      const store = new StoreMemory();
      
      const storachaClient = await create({ principal, store });
      console.log('✅ Client created with signer');
      
      const parsedProof = await Proof.parse(cleanProof);
      
      console.log('🔍 Checking proof capabilities...');
      const capabilities = parsedProof.capabilities || [];
      console.log('Proof capabilities:', capabilities);
      
      const requiredCapabilities = ['space/blob/add', 'space/index/add', 'upload/add'];
      const missingCapabilities = requiredCapabilities.filter(
        cap => !capabilities.some((c: any) => 
          typeof c === 'string' ? c.includes(cap) : JSON.stringify(c).includes(cap)
        )
      );
      
      if (missingCapabilities.length > 0) {
        console.warn('⚠️ Missing capabilities in proof:', missingCapabilities);
        throw new Error(`Delegation proof missing required capabilities: ${missingCapabilities.join(', ')}. Please regenerate with proper permissions.`);
      }
      
      await storachaClient.addSpace(parsedProof);
      console.log('✅ Proof added to client');
      
      let currentSpace;
      const spaces = await storachaClient.spaces();
      
      if (delegationConfig.spaceDid) {
        // Try to find the space with the provided DID
        currentSpace = spaces.find((s: any) => s.did() === delegationConfig.spaceDid);
        if (currentSpace) {
          console.log('✅ Using provided space:', delegationConfig.spaceDid);
        } else {
          console.warn(`Provided space DID "${delegationConfig.spaceDid}" not found in client's known spaces.`);
          // Fall back to the first available space
          currentSpace = spaces.length > 0 ? spaces[0] : null;
        }
      } else {
        // If no space DID was provided, use the first available space
        currentSpace = spaces.length > 0 ? spaces[0] : null;
      }

      if (!currentSpace) {
        throw new Error('No space available. The provided proof may not delegate access to a usable space, or the client failed to initialize it.');
      }

      // Set the selected space as the current space
      await storachaClient.setCurrentSpace(currentSpace.did());
      console.log('✅ Current space set to:', currentSpace.did());

      const session: UserSession = {
        email: 'delegation@user',
        isLoggedIn: true,
        method: 'delegation',
        spaceDid: currentSpace.did(),
        agentDid: storachaClient.agent?.did()
      };

      saveSession(session);
      setClient(storachaClient);
      setSpace(currentSpace);
      setSpaceDid(currentSpace.did());

      console.log('✅ Delegation setup successful!');
      console.log('Space DID:', currentSpace.did());
      console.log('Agent DID:', storachaClient.agent?.did());
      
      return true;

    } catch (err: any) {
      const errorMessage = err.message || 'Delegation setup failed';
      setError(errorMessage);
      console.error('❌ Delegation setup error:', err);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [saveSession]);

  // Refresh spaces
  const refreshSpaces = useCallback(async (): Promise<void> => {
    if (!client) return;
    
    try {
      console.log('=== Refreshing spaces ===');
      const spaces = await client.spaces();
      console.log('Available spaces:', spaces);
      
      if (spaces && spaces.length > 0) {
        const space = spaces[0];
        console.log('Setting space as current:', space.did());
        
        await client.setCurrentSpace(space.did());
        setSpace(space);
        setSpaceDid(space.did());
        
        const session: UserSession = {
          ...userSession,
          spaceDid: space.did()
        };
        saveSession(session);
        
        console.log('Space refreshed successfully:', space.did());
      } else {
        console.log('No spaces available in client');
        setSpace(null);
        setSpaceDid(null);
      }
    } catch (err) {
      console.error('Error refreshing spaces:', err);
    }
  }, [client, userSession, saveSession]);

  // Upload file
  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    if (!client || !space) {
      return {
        success: false,
        size: file.size,
        name: file.name,
        error: 'Please setup delegation first. Client or space not initialized.'
      };
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('📤 Starting upload:', file.name);
      console.log('File size:', file.size, 'bytes');
      console.log('Client:', client ? 'OK' : 'NULL');
      console.log('Space:', space ? 'OK' : 'NULL');
      console.log('Space DID:', space.did());

      let cid;
      try {
        cid = await client.uploadFile(file);
        console.log('✅ File uploaded successfully, CID:', cid);
      } catch (uploadErr: any) {
        console.error('❌ Upload failed:', uploadErr);
        
        if (uploadErr.message?.includes('space/blob/add') || 
            uploadErr.message?.includes('permission denied') ||
            uploadErr.message?.includes('capability')) {
          throw new Error(`Upload permission denied: ${uploadErr.message}. Your delegation may not have 'space/blob/add' capability.`);
        }
        throw uploadErr;
      }

      const cidString = String(cid);
      const gatewayUrl = `https://${cidString}.ipfs.storacha.link`;

      const uploadedFile = {
        id: `${cidString}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        cid: cidString,
        uploadedAt: new Date(),
        gatewayUrl,
        thumbnailUrl: file.type.startsWith('image/') ? `${gatewayUrl}?img-width=300&img-height=300&img-fit=cover` : undefined
      };

      return {
        success: true,
        cid: cidString,
        url: `ipfs://${cidString}`,
        gatewayUrl,
        size: file.size,
        name: file.name,
        file: uploadedFile
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
      
      return {
        success: false,
        size: file.size,
        name: file.name,
        error: errorMessage
      };
    } finally {
      setIsUploading(false);
    }
  }, [client, space]);

  const logout = useCallback(() => {
    console.log('👋 Logging out');
    setClient(null);
    setSpace(null);
    setSpaceDid(null);
    clearSession();
    setError(null);
  }, [clearSession]);

  // Auto-initialize if session exists
  useEffect(() => {
    const initializeFromSession = async () => {
      if (userSession.isLoggedIn && userSession.method === 'delegation' && !client) {
        console.log('Auto-initializing from session...');
        await initializeClient();
      }
    };
    initializeFromSession();
  }, [userSession, client, initializeClient]);

  return {
    client,
    space,
    spaceDid,
    isInitializing,
    isUploading,
    error,
    isReady: !!client && !!spaceDid,
    userSession,
    initializeClient,
    setupDelegation,
    uploadFile,
    logout,
    refreshSpaces
  };
}
