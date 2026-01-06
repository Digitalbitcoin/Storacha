import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Flex,
  Text,
  Card,
  Button,
  Progress,
  Badge,
  Container,
  Heading,
  Separator,
  IconButton,
  AlertDialog,
  ScrollArea,
  Grid
} from '@radix-ui/themes';
import {
  UploadIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  ArchiveIcon, 
  LockClosedIcon,
  CheckCircledIcon,
  ClockIcon,
  CrossCircledIcon,
  FileTextIcon,
  PersonIcon,
  RocketIcon,
  InfoCircledIcon,
  TrashIcon,
  ReloadIcon,
  TextAlignCenterIcon
} from '@radix-ui/react-icons';
import { AudioLinesIcon, FileAudioIcon } from 'lucide-react';

interface UploadProps {
  onUploadComplete?: (results: any[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  isConnected: boolean;
  userEmail?: string;
  spaceDid?: string;
  onUpload: (files: File[], descriptions?: string[]) => Promise<any[]>;
  uploadProgress: any[];
  formatFileSize: (bytes: number) => string;
}

export const StorachaUpload: React.FC<UploadProps> = ({
  onUploadComplete,
  maxSize = 100 * 1024 * 1024,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
    'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.m4a'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md', '.json', '.csv', '.html', '.css', '.js'],
    'application/zip': ['.zip', '.rar', '.7z', '.tar', '.gz']
  },
  isConnected,
  userEmail,
  spaceDid,
  onUpload,
  uploadProgress,
  formatFileSize
}) => {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [showFilePreview, setShowFilePreview] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!isConnected) return;
    setFilesToUpload(prev => [...prev, ...acceptedFiles]);
    setShowFilePreview(true);
  }, [isConnected]);

  const handleUpload = async () => {
    if (!isConnected || filesToUpload.length === 0) return;

    setIsUploading(true);
    const descArray = filesToUpload.map(file => descriptions[file.name] || '');
    const results = await onUpload(filesToUpload, descArray);

    setDescriptions({});
    setFilesToUpload([]);
    setShowFilePreview(false);
    setIsUploading(false);
    onUploadComplete?.(results);
  };

  const removeFile = (fileName: string) => {
    setFilesToUpload(prev => prev.filter(file => file.name !== fileName));
    const newDescriptions = { ...descriptions };
    delete newDescriptions[fileName];
    setDescriptions(newDescriptions);
  };

  const clearAllFiles = () => {
    setFilesToUpload([]);
    setDescriptions({});
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
    multiple: true,
    disabled: !isConnected || isUploading
  });

  const activeUploads = uploadProgress.filter(
    upload => upload.status === 'pending' || upload.status === 'uploading'
  );

  const totalFilesSize = filesToUpload.reduce((sum, file) => sum + file.size, 0);
  const isOverLimit = totalFilesSize > maxSize;

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon width="20" height="20" />;
    if (type.startsWith('video/')) return <VideoIcon width="20" height="20" />;
    if (type.startsWith('audio/')) return <FileAudioIcon width="20" height="20" />;
    if (type.includes('pdf')) return <FileIcon width="20" height="20" />;
    if (type.includes('zip') || type.includes('archive')) return <ArchiveIcon width="20" height="20" />;
    if (type.includes('text')) return <TextAlignCenterIcon width="20" height="20" />;
    return <FileIcon width="20" height="20" />;
  };

  if (!isConnected) {
    return (
      <Container size="2" p="4">
        <Card variant="surface" style={{ borderStyle: 'dashed' }}>
          <Flex direction="column" align="center" gap="4" p="6">
            <Flex
              align="center"
              justify="center"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--red-3)',
                color: 'var(--red-11)'
              }}
            >
              <LockClosedIcon width="32" height="32" />
            </Flex>
            <Flex direction="column" align="center" gap="2">
              <Heading size="4">Authentication Required</Heading>
              <Text size="2" color="gray" align="center">
                Please login to upload files to the decentralized IPFS network
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="3">
          <Flex align="center" gap="3">
            <RocketIcon width="24" height="24" color="var(--accent-11)" />
            <Heading size="6">IPFS File Upload</Heading>
            <Badge variant="soft" color="jade">Connected</Badge>
          </Flex>
          
          <Card variant="ghost" size="1">
            <Flex align="center" gap="2">
              <PersonIcon width="16" height="16" />
              <Text size="2">
                <strong>{userEmail}</strong>
                {spaceDid && (
                  <Text color="gray" as="span" ml="2">
                    Space: {spaceDid.slice(0, 16)}...
                  </Text>
                )}
              </Text>
            </Flex>
          </Card>
        </Flex>

        <Card 
          variant="surface" 
          {...getRootProps()}
          style={{
            cursor: isUploading ? 'not-allowed' : 'pointer',
            borderStyle: isDragActive ? 'solid' : 'dashed',
            borderWidth: '2px',
            background: isDragActive ? 'var(--accent-a3)' : 'transparent',
            transition: 'all 0.2s ease',
            opacity: isUploading ? 0.6 : 1
          }}
        >
          <input {...getInputProps()} />
          <Flex direction="column" align="center" justify="center" gap="4" p="8">
            {isUploading ? (
              <Flex direction="column" align="center" gap="4">
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--accent-a3)',
                    animation: 'spin 1s linear infinite'
                  }}
                >
                  <ReloadIcon width="28" height="28" color="var(--accent-11)" />
                </Flex>
                <Flex direction="column" align="center" gap="1">
                  <Heading size="4">Uploading to IPFS...</Heading>
                  <Text size="2" color="gray">
                    Your files are being pinned to the decentralized network
                  </Text>
                </Flex>
              </Flex>
            ) : (
              <>
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#e91315',
                    color: 'white'
                  }}
                >
                  <UploadIcon width="32" height="32" />
                </Flex>
                <Flex direction="column" align="center" gap="2">
                  <Heading size="4">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </Heading>
                  <Text size="2" color="gray" align="center">
                    or click to browse. Supports images, videos, documents, and more
                  </Text>
                  <Badge variant="soft" size="1" mt="2">
                    Max {formatFileSize(maxSize)} per file
                  </Badge>
                </Flex>
              </>
            )}
          </Flex>
        </Card>

        {filesToUpload.length > 0 && showFilePreview && (
          <Card variant="surface">
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Flex align="center" gap="3">
                  <FileTextIcon width="20" height="20" />
                  <Heading size="4">Files to Upload ({filesToUpload.length})</Heading>
                </Flex>
                <Flex gap="2">
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <Button variant="soft" color="red" size="2">
                        <TrashIcon /> Clear All
                      </Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content maxWidth="450px">
                      <AlertDialog.Title>Clear all files?</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        This will remove all {filesToUpload.length} files from the upload queue.
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <Button variant="soft" color="gray">Cancel</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <Button variant="solid" color="red" onClick={clearAllFiles}>
                            Clear All
                          </Button>
                        </AlertDialog.Action>
                      </Flex>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Flex>
              </Flex>

              {isOverLimit && (
                <Card variant="surface">
                  <Flex align="center" gap="2">
                    <CrossCircledIcon color="var(--red-11)" />
                    <Text size="2" color="red">
                      Total size ({formatFileSize(totalFilesSize)}) exceeds maximum limit ({formatFileSize(maxSize)})
                    </Text>
                  </Flex>
                </Card>
              )}

              <ScrollArea style={{ maxHeight: '300px' }}>
                <Grid columns="2" gap="3">
                  {filesToUpload.map((file) => (
                    <Card key={file.name} size="1" variant="surface">
                      <Flex direction="column" gap="2">
                        <Flex justify="between" align="start">
                          <Flex align="center" gap="2" style={{ flex: 1 }}>
                            {getFileIcon(file.type)}
                            <Text size="2" weight="medium" truncate>
                              {file.name}
                            </Text>
                          </Flex>
                          <IconButton
                            size="1"
                            variant="ghost"
                            color="gray"
                            onClick={() => removeFile(file.name)}
                          >
                            <TrashIcon width="14" height="14" />
                          </IconButton>
                        </Flex>
                        
                        <Text size="1" color="gray">
                          {formatFileSize(file.size)} • {file.type}
                        </Text>

                        <Box>
                          <Text as="label" size="1" weight="medium" mb="1">
                            Description (optional)
                          </Text>
                          <input
                            type="text"
                            placeholder="Add a description..."
                            value={descriptions[file.name] || ''}
                            onChange={(e) => setDescriptions(prev => ({
                              ...prev,
                              [file.name]: e.target.value
                            }))}
                            style={{
                              width: '100%',
                              padding: 'var(--space-1) var(--space-2)',
                              border: '1px solid var(--gray-6)',
                              borderRadius: 'var(--radius-1)',
                              fontSize: 'var(--font-size-1)'
                            }}
                          />
                        </Box>
                      </Flex>
                    </Card>
                  ))}
                </Grid>
              </ScrollArea>

              <Separator />

              <Flex justify="between" align="center">
                <Flex direction="column" gap="1">
                  <Text size="2" color="gray">Total: {filesToUpload.length} files</Text>
                  <Text size="2" weight="medium">{formatFileSize(totalFilesSize)}</Text>
                </Flex>
                <Button
                  size="3"
                  onClick={handleUpload}
                  disabled={isUploading || filesToUpload.length === 0 || isOverLimit}
                >
                  <UploadIcon /> Upload to IPFS
                </Button>
              </Flex>
            </Flex>
          </Card>
        )}

        {activeUploads.length > 0 && (
          <Card variant="surface">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <ClockIcon width="20" height="20" color="var(--amber-11)" />
                <Heading size="4">Active Uploads</Heading>
                <Badge variant="soft" color="amber">{activeUploads.length}</Badge>
              </Flex>

              <Flex direction="column" gap="3">
                {activeUploads.map((upload) => (
                  <Card key={upload.fileId} variant="ghost" size="1">
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="center">
                        <Text size="2" weight="medium" truncate>{upload.fileName}</Text>
                        <Badge variant="soft" size="1">{upload.status}</Badge>
                      </Flex>
                      
                      <Progress value={upload.progress} size="1" color="blue" />
                      
                      <Flex justify="between" align="center">
                        <Text size="1" color="gray">
                          {formatFileSize(upload.bytesUploaded)} / {formatFileSize(upload.totalBytes)}
                        </Text>
                        <Text size="1" weight="medium">{upload.progress}%</Text>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Flex>
          </Card>
        )}

        <Card variant="surface">
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2">
              <InfoCircledIcon width="20" height="20" />
              <Heading size="4">Supported Formats</Heading>
            </Flex>
            
            <Grid columns={{ initial: '2', md: '3' }} gap="3">
              {Object.entries(accept).map(([type, extensions]) => (
                <Card key={type} variant="ghost" size="1">
                  <Flex align="center" gap="3">
                    {type.startsWith('image/') && <ImageIcon color="var(--blue-11)" />}
                    {type.startsWith('video/') && <VideoIcon color="var(--purple-11)" />}
                    {type.startsWith('audio/') && <AudioLinesIcon color="var(--green-11)" />}
                    {type.includes('pdf') && <FileIcon color="var(--red-11)" />}
                    {type.includes('text/') && <TextAlignCenterIcon color="var(--gray-11)" />}
                    {type.includes('zip') && <ArchiveIcon color="var(--amber-11)" />}
                    <Flex direction="column" gap="1">
                      <Text size="1" weight="medium">{type.split('/*')[0] || type}</Text>
                      <Text size="1" color="gray">{extensions.join(', ')}</Text>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Grid>

            <Card variant="surface" size="1">
              <Flex align="center" gap="2">
                <CheckCircledIcon color="var(--green-11)" />
                <Text size="1">
                  All files are permanently stored on the decentralized IPFS network
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
};
