import React, { useState, useMemo } from 'react';
import { 
  Grid, 
  Flex, 
  Text, 
  Button, 
  Card,
  Badge, 
  Box, 
  IconButton,
  Dialog,
  Tooltip,
  ScrollArea,
  Heading,
  Container,
  AspectRatio,
  HoverCard,
  Tabs,
  Table
} from '@radix-ui/themes';
import { 
  FileIcon, 
  ImageIcon, 
  VideoIcon,
  DownloadIcon, 
  CopyIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FileTextIcon,
  ArchiveIcon,
  Link2Icon,
  EyeOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SymbolIcon,
  SizeIcon,
  InfoCircledIcon  
} from '@radix-ui/react-icons';
import { AudioLinesIcon } from 'lucide-react';
import { ViewMode } from '../../types';

interface FileGalleryProps {
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    cid: string;
    uploadedAt: Date;
    gatewayUrl: string;
    thumbnailUrl?: string;
    description?: string;
  }>;
  filterType?: string;
  searchQuery?: string;
  itemsPerPage?: number;
  onClear?: () => void;
  getShareableLink: (cid: string, fileName?: string) => string;
  formatFileSize: (bytes: number) => string;
  viewMode: ViewMode;
}

export const FileGallery: React.FC<FileGalleryProps> = ({ 
  files,
  filterType = 'all',
  searchQuery = '',
  itemsPerPage = 12,
  onClear,
  getShareableLink,
  formatFileSize,
  viewMode
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesType = filterType === 'all' || file.type.includes(filterType);
      const matchesSearch = searchQuery === '' || 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [files, filterType, searchQuery]);

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFiles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFiles, currentPage, itemsPerPage]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon width="24" height="24" />;
    if (type.startsWith('video/')) return <VideoIcon width="24" height="24" />;
    if (type.startsWith('audio/')) return <AudioLinesIcon width="24" height="24" />;
    if (type.includes('pdf')) return <FileTextIcon width="24" height="24" />;
    if (type.includes('text')) return <FileIcon width="24" height="24" />;
    if (type.includes('zip')) return <ArchiveIcon width="24" height="24" />;
    return <FileIcon width="24" height="24" />;
  };

  const getFileColor = (type: string) => {
    if (type.startsWith('image/')) return 'blue';
    if (type.startsWith('video/')) return 'purple';
    if (type.startsWith('audio/')) return 'green';
    if (type.includes('pdf')) return 'red';
    if (type.includes('text')) return 'gray';
    return 'amber';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyLink = async (cid: string, fileName?: string) => {
    const link = getShareableLink(cid, fileName);
    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const response = await fetch(file.gatewayUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Grid View Component
  const GridView = () => (
    <>
      <Grid columns={{ initial: '1', sm: '2', md: '3', lg: '4' }} gap="4">
        {paginatedFiles.map((file) => (
          <HoverCard.Root key={file.id}>
            <HoverCard.Trigger>
              <Card 
                variant="surface" 
                style={{ cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => {
                  setSelectedFile(file);
                  setIsDetailOpen(true);
                }}
              >
                <Flex direction="column" gap="3">
                  <AspectRatio ratio={16/9}>
                    {file.type.startsWith('image/') ? (
                      <img
                        src={file.thumbnailUrl || file.gatewayUrl}
                        alt={file.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-2)'
                        }}
                      />
                    ) : (
                      <Flex
                        align="center"
                        justify="center"
                        style={{
                          width: '100%',
                          height: '100%',
                          background: `var(--${getFileColor(file.type)}-3)`,
                          borderRadius: 'var(--radius-2)'
                        }}
                      >
                        {getFileIcon(file.type)}
                      </Flex>
                    )}
                  </AspectRatio>

                  <Flex direction="column" gap="2">
                    <Flex justify="between" align="start">
                      <Text size="2" weight="medium" truncate>
                        {file.name}
                      </Text>
                      <Badge variant="soft" color={getFileColor(file.type) as any} size="1">
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </Flex>

                    <Flex gap="3" align="center">
                      <Flex align="center" gap="1">
                        <SizeIcon width="12" height="12" color="gray" />
                        <Text size="1" color="gray">{formatFileSize(file.size)}</Text>
                      </Flex>
                      <Flex align="center" gap="1">
                        <CalendarIcon width="12" height="12" color="gray" />
                        <Text size="1" color="gray">{formatDate(file.uploadedAt)}</Text>
                      </Flex>
                    </Flex>

                    <Flex gap="2">
                      <Tooltip content="Copy IPFS link">
                        <IconButton
                          size="1"
                          variant="soft"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(file.cid);
                          }}
                        >
                          <CopyIcon width="14" height="14" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Download">
                        <IconButton
                          size="1"
                          variant="soft"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                        >
                          <DownloadIcon width="14" height="14" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="View details">
                        <IconButton
                          size="1"
                          variant="soft"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                            setIsDetailOpen(true);
                          }}
                        >
                          <EyeOpenIcon width="14" height="14" />
                        </IconButton>
                      </Tooltip>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
            </HoverCard.Trigger>
            
            <HoverCard.Content maxWidth="300px">
              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">{file.name}</Text>
                {file.description && (
                  <Text size="1" color="gray">{file.description}</Text>
                )}
                <Text size="1">
                  <Flex align="center" gap="1">
                    <Link2Icon width="12" height="12" />
                    CID: {file.cid.slice(0, 12)}...
                  </Flex>
                </Text>
              </Flex>
            </HoverCard.Content>
          </HoverCard.Root>
        ))}
      </Grid>
    </>
  );

  // List View Component
  const ListView = () => (
    <Card variant="surface">
      <ScrollArea style={{ maxHeight: '600px' }}>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>File</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Upload Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>CID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          
          <Table.Body>
            {paginatedFiles.map((file) => (
              <Table.Row key={file.id} style={{ cursor: 'pointer' }}>
                <Table.RowHeaderCell onClick={() => {
                  setSelectedFile(file);
                  setIsDetailOpen(true);
                }}>
                  <Flex gap="3" align="center">
                    <Box style={{ color: `var(--${getFileColor(file.type)}-9)` }}>
                      {getFileIcon(file.type)}
                    </Box>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">{file.name}</Text>
                      {file.description && (
                        <Text size="1" color="gray" truncate>{file.description}</Text>
                      )}
                    </Flex>
                  </Flex>
                </Table.RowHeaderCell>
                
                <Table.Cell>
                  <Badge variant="soft" color={getFileColor(file.type) as any}>
                    {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                </Table.Cell>
                
                <Table.Cell>
                  <Text size="2">{formatFileSize(file.size)}</Text>
                </Table.Cell>
                
                <Table.Cell>
                  <Text size="2">{formatDate(file.uploadedAt)}</Text>
                </Table.Cell>
                
                <Table.Cell>
                  <Tooltip content={file.cid}>
                    <Text size="1" style={{ fontFamily: 'monospace' }}>
                      {file.cid.slice(0, 8)}...
                    </Text>
                  </Tooltip>
                </Table.Cell>
                
                <Table.Cell>
                  <Flex gap="2">
                    <Tooltip content="Copy IPFS link">
                      <IconButton
                        size="1"
                        variant="ghost"
                        onClick={() => handleCopyLink(file.cid, file.name)}
                      >
                        <CopyIcon width="14" height="14" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Download">
                      <IconButton
                        size="1"
                        variant="ghost"
                        onClick={() => handleDownload(file)}
                      >
                        <DownloadIcon width="14" height="14" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="View details">
                      <IconButton
                        size="1"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFile(file);
                          setIsDetailOpen(true);
                        }}
                      >
                        <EyeOpenIcon width="14" height="14" />
                      </IconButton>
                    </Tooltip>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </ScrollArea>
    </Card>
  );

  if (files.length === 0) {
    return (
      <Container p="8">
        <Flex direction="column" align="center" justify="center" gap="4" style={{ minHeight: '400px' }}>
          <Box
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--accent-a3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SymbolIcon width="48" height="48" color="var(--accent-11)" />
          </Box>
          <Flex direction="column" align="center" gap="2">
            <Heading size="6" color="gray">Your gallery is empty</Heading>
            <Text size="3" color="gray" align="center">
              Upload your first file to start building your IPFS collection
            </Text>
          </Flex>
        </Flex>
      </Container>
    );
  }

  return (
    <Container>
      <Flex direction="column" gap="6">
        <Flex justify="between" align="center">
          <Flex align="center" gap="3">
            <Heading size="6">IPFS Gallery</Heading>
            <Badge variant="soft" color="jade">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </Badge>
          </Flex>
          
          {onClear && (
            <Dialog.Root>
              <Dialog.Trigger>
                <Button variant="soft" color="red">
                  <TrashIcon /> Clear All
                </Button>
              </Dialog.Trigger>
              <Dialog.Content style={{ maxWidth: 400 }}>
                <Dialog.Title>Clear Gallery</Dialog.Title>
                <Dialog.Description size="2">
                  This will remove all files from your local history. Your files remain on IPFS.
                </Dialog.Description>
                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">Cancel</Button>
                  </Dialog.Close>
                  <Dialog.Close>
                    <Button variant="solid" color="red" onClick={onClear}>
                      Clear History
                    </Button>
                  </Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
          )}
        </Flex>

        {filteredFiles.length !== files.length && (
          <Flex align="center" gap="2">
            <MagnifyingGlassIcon color="gray" />
            <Text size="2" color="gray">
              Showing {filteredFiles.length} of {files.length} files
            </Text>
          </Flex>
        )}

        {filteredFiles.length === 0 ? (
          <Box py="8">
            <Flex direction="column" align="center" gap="3">
              <MagnifyingGlassIcon width="32" height="32" color="gray" />
              <Text size="3" color="gray">No files match your search criteria</Text>
            </Flex>
          </Box>
        ) : (
          <>
            {/* Render the selected view mode */}
            {viewMode === 'grid' ? <GridView /> : <ListView />}

            {totalPages > 1 && (
              <Flex justify="center" align="center" gap="4" py="4">
                <Button
                  variant="soft"
                  size="2"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon /> Previous
                </Button>
                
                <Flex gap="2" align="center">
                  <Badge variant="soft">{currentPage} / {totalPages}</Badge>
                  <Text size="2" color="gray">Page</Text>
                </Flex>
                
                <Button
                  variant="soft"
                  size="2"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRightIcon />
                </Button>
              </Flex>
            )}
          </>
        )}

        <Dialog.Root open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <Dialog.Content maxWidth="800px">
            {selectedFile && (
              <>
                <Dialog.Title>
                  <Flex align="center" gap="3">
                    {getFileIcon(selectedFile.type)}
                    <Text style={{ flex: 1 }} truncate>{selectedFile.name}</Text>
                    <Badge variant="soft" color={getFileColor(selectedFile.type) as any}>
                      {selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </Flex>
                </Dialog.Title>
                
                <ScrollArea style={{ maxHeight: '70vh' }}>
                  <Flex direction="column" gap="6" p="4">
                    <Flex justify="center">
                      {selectedFile.type.startsWith('image/') ? (
                        <img
                          src={selectedFile.gatewayUrl}
                          alt={selectedFile.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            borderRadius: 'var(--radius-3)',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            width: '100%',
                            height: '300px',
                            background: `var(--${getFileColor(selectedFile.type)}-3)`,
                            borderRadius: 'var(--radius-3)'
                          }}
                        >
                          {getFileIcon(selectedFile.type)}
                          <Text size="6" weight="bold" ml="3">
                            {selectedFile.type.split('/')[1]?.toUpperCase()}
                          </Text>
                        </Flex>
                      )}
                    </Flex>

                    <Tabs.Root defaultValue="details">
                      <Tabs.List>
                        <Tabs.Trigger value="details">Details</Tabs.Trigger>
                        <Tabs.Trigger value="sharing">Sharing</Tabs.Trigger>
                        <Tabs.Trigger value="metadata">Metadata</Tabs.Trigger>
                      </Tabs.List>

                      <Box pt="4">
                        <Tabs.Content value="details">
                          <Flex direction="column" gap="4">
                            {selectedFile.description && (
                              <Box>
                                <Text as="div" size="2" weight="medium" mb="2">Description</Text>
                                <Card variant="surface">
                                  <Text size="2">{selectedFile.description}</Text>
                                </Card>
                              </Box>
                            )}

                            <Grid columns="2" gap="4">
                              <Flex direction="column" gap="1">
                                <Text size="1" color="gray">
                                  <Flex align="center" gap="1"><SizeIcon /> File Size</Flex>
                                </Text>
                                <Text size="2">{formatFileSize(selectedFile.size)}</Text>
                              </Flex>
                              
                              <Flex direction="column" gap="1">
                                <Text size="1" color="gray">
                                  <Flex align="center" gap="1"><CalendarIcon /> Upload Date</Flex>
                                </Text>
                                <Text size="2">{formatDate(selectedFile.uploadedAt)}</Text>
                              </Flex>
                              
                              <Flex direction="column" gap="1">
                                <Text size="1" color="gray">MIME Type</Text>
                                <Text size="2">{selectedFile.type}</Text>
                              </Flex>
                              
                              <Flex direction="column" gap="1">
                                <Text size="1" color="gray">
                                  <Flex align="center" gap="1"><InfoCircledIcon /> Status</Flex>
                                </Text>
                                <Badge variant="soft" color="jade">Available on IPFS</Badge>
                              </Flex>
                            </Grid>
                          </Flex>
                        </Tabs.Content>

                        <Tabs.Content value="sharing">
                          <Flex direction="column" gap="4">
                            <Flex direction="column" gap="2">
                              <Text size="2" weight="medium">IPFS Content Identifier (CID)</Text>
                              <Card variant="surface">
                                <Flex align="center" justify="between">
                                  <Text size="1" style={{ wordBreak: 'break-all' }}>
                                    {selectedFile.cid}
                                  </Text>
                                  <Tooltip content="Copy CID">
                                    <IconButton
                                      size="1"
                                      variant="solid"
                                      onClick={() => navigator.clipboard.writeText(selectedFile.cid)}
                                    >
                                      <CopyIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Flex>
                              </Card>
                            </Flex>

                            <Flex direction="column" gap="2">
                              <Text size="2" weight="medium">Shareable Link</Text>
                              <Card variant="surface">
                                <Flex align="center" gap="2">
                                  <input
                                    type="text"
                                    value={getShareableLink(selectedFile.cid)}
                                    readOnly
                                    style={{
                                      flex: 1,
                                      padding: 'var(--space-1) var(--space-2)',
                                      border: '1px solid var(--gray-6)',
                                      borderRadius: 'var(--radius-1)',
                                      background: 'var(--gray-2)',
                                      fontSize: 'var(--font-size-1)',
                                      fontFamily: 'var(--font-family-mono)'
                                    }}
                                  />
                                  <Tooltip content="Copy link">
                                    <IconButton
                                      size="2"
                                      variant="solid"
                                      onClick={() => handleCopyLink(selectedFile.cid)}
                                    >
                                      <CopyIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Flex>
                              </Card>
                            </Flex>

                            <Text size="1" color="gray">
                              This content is permanently stored on the decentralized IPFS network
                            </Text>
                          </Flex>
                        </Tabs.Content>

                        <Tabs.Content value="metadata">
                          <Flex direction="column" gap="3">
                            <Card variant="surface">
                              <pre
                                style={{
                                  margin: 0,
                                  fontSize: 'var(--font-size-1)',
                                  fontFamily: 'var(--font-family-mono)',
                                  overflowX: 'auto'
                                }}
                              >
                                {JSON.stringify({
                                  name: selectedFile.name,
                                  type: selectedFile.type,
                                  size: selectedFile.size,
                                  cid: selectedFile.cid,
                                  uploadedAt: selectedFile.uploadedAt.toISOString(),
                                  gateway: selectedFile.gatewayUrl
                                }, null, 2)}
                              </pre>
                            </Card>
                          </Flex>
                        </Tabs.Content>
                      </Box>
                    </Tabs.Root>

                    <Flex gap="3" justify="end">
                      <Button
                        variant="soft"
                        onClick={() => handleCopyLink(selectedFile.cid)}
                      >
                        <CopyIcon /> Copy Link
                      </Button>
                      <Button
                        variant="solid"
                        onClick={() => handleDownload(selectedFile)}
                      >
                        <DownloadIcon /> Download
                      </Button>
                      <Dialog.Close>
                        <Button variant="outline">Close</Button>
                      </Dialog.Close>
                    </Flex>
                  </Flex>
                </ScrollArea>
              </>
            )}
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
    </Container>
  );
};
