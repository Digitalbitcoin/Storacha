export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  cid: string;
  uploadedAt: Date;
  gatewayUrl: string;
  thumbnailUrl?: string;
  description?: string;
}

export type ViewMode = 'grid' | 'list';
export type FilterType = 'all' | 'image' | 'video' | 'document' | 'audio' | 'archive';

export interface UploadResult {
  cid: string;
  url: string;
  success: boolean;
  error?: string;
  file?: UploadedFile;
}

export interface DelegationConfig {
  key: string;
  proof: string;
  spaceDid?: string;
}

export interface UserSession {
  email: string;
  isLoggedIn: boolean;
  method: 'email' | 'delegation' | null;
  spaceDid?: string;
  agentDid?: string;
}

export interface SpaceInfo {
  name: string;
  did: string;
  createdAt: Date;
  storageUsed: number;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  bytesUploaded: number;
  totalBytes: number;
}

export interface StorachaConfig {
  defaultGateway?: string;
  autoConnect?: boolean;
  persistSession?: boolean;
  maxUploadSize?: number;
}
