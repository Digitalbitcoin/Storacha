import { useState, useEffect, useCallback, useRef } from 'react';
import { create } from '@storacha/client';
import type { 
  UploadedFile, 
  UploadResult, 
  DelegationConfig, 
  UserSession,
  UploadProgress 
} from '../types';

const DEFAULT_GATEWAY = 'storacha.link';
const DEFAULT_SPACE_NAME = 'artboard-space';
const SESSION_KEY = 'storacha_session';
const UPLOADS_KEY = 'storacha_uploads';

const cleanBase64 = (input: string): string => {
  return input.replace(/[^A-Za-z0-9+/=]/g, '').trim();
};

export const useStoracha = () => {
  const [client, setClient] = useState<any>(null);
  const [space, setSpace] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem(UPLOADS_KEY);
    return saved ? JSON.parse(saved).map((f: any) => ({
      ...f,
      uploadedAt: new Date(f.uploadedAt)
    })) : [];
  });
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

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

  const saveUploads = useCallback((files: UploadedFile[]) => {
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(files));
  }, []);

  const loginWithEmail = useCallback(async (userEmail: string) => {
    try {
      setIsInitializing(true);
      setError(null);

      if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('📧 Logging in with email:', userEmail);
      
      const storachaClient = await create();
      const account = await storachaClient.login(userEmail as `${string}@${string}`);
      
      await account.plan.wait();
      
      let storachaSpace;
      try {
        if (storachaClient.spaces) {
          const spaces = await storachaClient.spaces();
          const existingSpace = spaces.find((s: any) => 
            s.name === DEFAULT_SPACE_NAME || s.did().includes('space')
          );
          
          if (existingSpace) {
            storachaSpace = existingSpace;
            await storachaClient.setCurrentSpace(existingSpace.did());
          } else {
            storachaSpace = await storachaClient.createSpace(DEFAULT_SPACE_NAME, { account });
            await storachaClient.setCurrentSpace(storachaSpace.did());
          }
        } else {
          storachaSpace = await storachaClient.createSpace(DEFAULT_SPACE_NAME, { account });
          await storachaClient.setCurrentSpace(storachaSpace.did());
        }
      } catch (spaceError) {
        console.warn('Space creation error:', spaceError);
        storachaSpace = await storachaClient.createSpace(DEFAULT_SPACE_NAME, { account });
        await storachaClient.setCurrentSpace(storachaSpace.did());
      }

      const session: UserSession = {
        email: userEmail,
        isLoggedIn: true,
        method: 'email',
        spaceDid: storachaSpace.did(),
        agentDid: storachaClient.agent?.did()
      };

      saveSession(session);
      setClient(storachaClient);
      setSpace(storachaSpace);
      setIsConnected(true);

      console.log('✅ Email login successful');
      return { success: true, session };

    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      setIsConnected(false);
      console.error('❌ Email login error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsInitializing(false);
    }
  }, [saveSession]);

  
  const loginWithDelegation = useCallback(async (delegationConfig: DelegationConfig) => {
    try {
      setIsInitializing(true);
      setError(null);

      console.log('🔐 Attempting delegation login with config:', {
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

      const { StoreMemory } = await import('@storacha/client/stores/memory');
      const { create: createClient } = await import('@storacha/client');
      const { Signer } = await import('@storacha/client/principal/ed25519');
      
      try {
        const principal = Signer.parse(cleanKey);
        const store = new StoreMemory();
        
        const storachaClient = await createClient({ principal, store });
        console.log('✅ Client created with signer');
        
        const Proof = await import('@storacha/client/proof');
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

          // FIXED: Set the selected space as the current space [citation:1]
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
        setIsConnected(true);

        console.log('✅ Delegation login successful!');
        console.log('Space DID:', currentSpace.did());
        console.log('Agent DID:', storachaClient.agent?.did());
        
        return { success: true, session };

      } catch (innerErr: any) {
        console.error('❌ Inner delegation error:', innerErr);
        throw innerErr;
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Delegation login failed';
      setError(errorMessage);
      setIsConnected(false);
      console.error('❌ Delegation login error:', err);
      return { 
        success: false, 
        error: errorMessage,
        details: err.toString()
      };
    } finally {
      setIsInitializing(false);
    }
  }, [saveSession]);

  const logout = useCallback(() => {
    console.log('👋 Logging out');
    setClient(null);
    setSpace(null);
    setIsConnected(false);
    clearSession();
    setError(null);
    setUploadProgress({});
  }, [clearSession]);

  const uploadFile = useCallback(async (file: File, description?: string): Promise<UploadResult> => {
    const fileId = `${Date.now()}-${file.name}`;
    const controller = new AbortController();
    abortControllers.current.set(fileId, controller);

    setUploadProgress(prev => ({
      ...prev,
      [fileId]: {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'pending',
        bytesUploaded: 0,
        totalBytes: file.size
      }
    }));

    try {
      if (!client || !space) {
        throw new Error('Please login first. Client or space not initialized.');
      }

      console.log('📤 Starting upload:', file.name);
      console.log('File size:', file.size, 'bytes');
      console.log('Client:', client ? 'OK' : 'NULL');
      console.log('Space:', space ? 'OK' : 'NULL');
      console.log('Space DID:', space.did?.());

      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'uploading', progress: 5 }
      }));

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId];
          if (current && current.status === 'uploading' && current.progress < 90) {
            return {
              ...prev,
              [fileId]: { 
                ...current, 
                progress: Math.min(current.progress + 10, 90),
                bytesUploaded: Math.floor((current.progress / 100) * file.size)
              }
            };
          }
          return prev;
        });
      }, 300);

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
      const gatewayUrl = `https://${cidString}.ipfs.${DEFAULT_GATEWAY}`;

      clearInterval(progressInterval);

      let thumbnailUrl = gatewayUrl;
      if (file.type.startsWith('image/')) {
        thumbnailUrl = `${gatewayUrl}?img-width=300&img-height=300&img-fit=cover`;
      }

      const uploadedFile: UploadedFile = {
        id: `${cidString}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        cid: cidString,
        uploadedAt: new Date(),
        gatewayUrl,
        thumbnailUrl,
        description
      };

      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { 
          ...prev[fileId], 
          status: 'completed', 
          progress: 100,
          bytesUploaded: file.size
        }
      }));

      setUploadedFiles(prev => {
        const updated = [uploadedFile, ...prev];
        saveUploads(updated);
        return updated;
      });

      setTimeout(() => {
        setUploadProgress(prev => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);

      return { 
        cid: cidString, 
        url: gatewayUrl, 
        success: true,
        file: uploadedFile
      };

    } catch (err: any) {
      const errorMsg = err.message || 'Upload failed';
      console.error('❌ Upload error:', errorMsg, err);
      
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'error', progress: 0 }
      }));

      setError(errorMsg);
      return { 
        cid: '', 
        url: '', 
        success: false, 
        error: errorMsg 
      };
    } finally {
      abortControllers.current.delete(fileId);
    }
  }, [client, space, saveUploads]);

  const uploadFiles = useCallback(async (files: File[], descriptions?: string[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const description = descriptions?.[i];
      const result = await uploadFile(files[i], description);
      results.push(result);
    }
    
    return results;
  }, [uploadFile]);

  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(fileId);
      
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'error', progress: 0 }
      }));
      
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });
      }, 1000);
    }
  }, []);

  const clearUploads = useCallback(() => {
    console.log('🗑️ Clearing all uploads');
    setUploadedFiles([]);
    saveUploads([]);
    setUploadProgress({});
    abortControllers.current.clear();
  }, [saveUploads]);

  const getShareableLink = useCallback((cid: string, fileName?: string) => {
    const baseUrl = `https://${cid}.ipfs.${DEFAULT_GATEWAY}`;
    if (fileName) {
      return `${baseUrl}/${encodeURIComponent(fileName)}`;
    }
    return baseUrl;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  useEffect(() => {
    const autoConnect = async () => {
      if (userSession.isLoggedIn && userSession.method === 'email' && userSession.email) {
        await loginWithEmail(userSession.email);
      }
    };
    autoConnect();
  }, []);

  return {
    client,
    space,
    isInitializing,
    uploadedFiles,
    error,
    isConnected,
    userSession,
    uploadProgress: Object.values(uploadProgress),
    loginWithEmail,
    loginWithDelegation,
    logout,
    uploadFile,
    uploadFiles,
    cancelUpload,
    clearUploads,
    getShareableLink,
    formatFileSize,
    saveSession,
    clearSession
  };
};
