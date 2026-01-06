import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Tabs,
  Card,
  Badge,
  Grid,
  IconButton,
  TextField,
  Progress,
  AlertDialog,
  DropdownMenu,
} from '@radix-ui/themes';
import {
  UploadIcon,
  FileIcon,
  DashboardIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  LightningBoltIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  ListBulletIcon
} from '@radix-ui/react-icons';
import { useStoracha } from '../hooks/useStoracha';
import { EmailLogin } from './Login/EmailLogin';
import { DelegationLogin } from './Login/DelegationLogin';
import { StorachaUpload } from './Upload/StorachaUpload';
import { FileGallery } from './Gallery/FileGallery';
import { NavigationBar } from './Navigation';
import { CreativeFooter } from './Layout/Footer';

export const Dashboard: React.FC<{ isDarkTheme: boolean; onThemeToggle: () => void }> = ({
  isDarkTheme,
  onThemeToggle
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'analytics'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDelegationLogin, setShowDelegationLogin] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { 
    isConnected, 
    logout, 
    userSession,
    uploadedFiles,
    clearUploads,
    loginWithEmail,
    loginWithDelegation,
    uploadFiles,
    uploadProgress,
    formatFileSize
  } = useStoracha();

  const handleEmailLogin = async (email: string) => {
    setIsLoginInProgress(true);
    setLoginError(null);
    const result = await loginWithEmail(email);
    setIsLoginInProgress(false);
    
    if (result.success) {
      setShowSuccessDialog(true);
    } else {
      setLoginError(result.error || 'Login failed');
    }
    return result;
  };

  const handleDelegationLogin = async (config: { key: string; proof: string; spaceDid?: string }) => {
    setIsLoginInProgress(true);
    setLoginError(null);
    const result = await loginWithDelegation(config);
    setIsLoginInProgress(false);
    
    if (result.success) {
      setShowSuccessDialog(true);
    } else {
      setLoginError(result.error || 'Delegation login failed');
    }
    return result;
  };

  const handleLoginSuccess = () => {
    setShowSuccessDialog(false);
    setShowDelegationLogin(false);
    setLoginError(null);
  };

  const handleUploadComplete = () => {
    setActiveTab('gallery');
    setMobileMenuOpen(false); // Close mobile menu on upload
  };

  const handleLogout = () => {
    logout();
    setShowDelegationLogin(false);
    setShowSuccessDialog(false)
    setLoginError(null);
    setMobileMenuOpen(false);
    setActiveTab('upload');
  };

  const getFileStats = () => {
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    const fileTypes = uploadedFiles.reduce((acc, file) => {
      const type = file.type.split('/')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const storagePercent = Math.min((totalSize / (100 * 1024 * 1024)) * 100, 100);
    
    return { totalSize, fileTypes, storagePercent };
  };

  const stats = getFileStats();

  // If not connected, show login screen
  if (!isConnected) {
    return (
      <Box style={{ minHeight: '100vh', padding: 'var(--space-4)' }}>
        <Flex direction="column" align="center" justify="center" gap="6" style={{ minHeight: '100vh' }}>
          {/* Status Badge */}
          <Badge 
            color="ruby" 
            variant="surface" 
            size="2"
          >
            🔌 Disconnected
          </Badge>

          {/* App Title */}
          <Flex direction="column" align="center" gap="2">
            <Box
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: '#e91315',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                color: 'white',
              }}
            >
              🔥
            </Box>
            <Text size="7" weight="bold" style={{ color: 'var(--mauve-12)' }}>
              Storacha Vault
            </Text>
            <Text size="2" color="gray" align="center">
              Secure decentralized storage powered by IPFS
            </Text>
          </Flex>

          {/* Login Error Display */}
          {loginError && (
            <Card variant="surface" style={{ maxWidth: '500px', width: '100%', borderColor: 'var(--red-6)' }}>
              <Flex direction="column" gap="2" p="3">
                <Text size="2" weight="bold" color="red">Login Error</Text>
                <Text size="1" color="gray">{loginError}</Text>
              </Flex>
            </Card>
          )}

          {/* Login Options */}
          {showDelegationLogin ? (
            <DelegationLogin 
              onLogin={handleDelegationLogin}
              onBack={() => setShowDelegationLogin(false)}
              isLoading={isLoginInProgress}
            />
          ) : (
            <EmailLogin 
              onLogin={handleEmailLogin}
              onSwitchToDelegation={() => setShowDelegationLogin(true)}
              isLoading={isLoginInProgress}
            />
          )}

          {/* Success Dialog */}
          <AlertDialog.Root open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <AlertDialog.Content maxWidth="450px">
              <Flex direction="column" align="center" gap="4" p="4">
                <Box
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, var(--green-9) 0%, var(--teal-9) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <CheckIcon width="30" height="30" />
                </Box>
                                
                <Button
                  size="3"
                  onClick={handleLoginSuccess}
                  style={{ 
                    background: 'linear-gradient(135deg, var(--ruby-9) 0%, var(--tomato-9) 100%)',
                    color: 'white',
                    width: '100%'
                  }}
                >
                  Continue to Dashboard
                </Button>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>

          {/* Features Grid */}
          <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4" width="100%" style={{ maxWidth: '1200px', marginTop: '40px' }}>
            {[
              { icon: '⚡', title: 'Blazing Fast', desc: 'Sub-second access' },
              { icon: '🛡️', title: 'Ironclad Security', desc: 'Zero-knowledge encryption' },
              { icon: '🌋', title: 'Volcanic Storage', desc: 'Scalable from MBs to PBs' },
              { icon: '🔥', title: 'Always Hot', desc: '99.99% uptime' },
              { icon: '🎯', title: 'Precision Control', desc: 'Granular permissions' },
              { icon: '🚀', title: 'Future Proof', desc: 'Decentralized protocols' }
            ].map((feature, index) => (
              <Card key={index} variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
                <Flex gap="3" align="center">
                  <Box style={{ fontSize: '24px' }}>{feature.icon}</Box>
                  <Flex direction="column">
                    <Text weight="bold">{feature.title}</Text>
                    <Text size="1" color="gray">{feature.desc}</Text>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Grid>

          {/* Theme Toggle in Login Screen */}
          <Flex gap="3" align="center" mt="6">
            <IconButton
              variant="ghost"
              onClick={onThemeToggle}
              style={{ color: 'var(--ruby-9)' }}
            >
              {isDarkTheme ? <SunIcon /> : <MoonIcon />}
            </IconButton>
            <Text size="1" color="gray">
              {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </Flex>
        </Flex>
      </Box>
    );
  }

  // Connected State - Dashboard
  return (
    <Box style={{ minHeight: '100vh' }}>
      {/* Navigation Bar */}
      {isConnected && (
      <NavigationBar
        isDarkTheme={isDarkTheme}
        onThemeToggle={onThemeToggle}
        onLogout={handleLogout}
        userEmail={userSession.email}
        storagePercent={stats.storagePercent}
        totalSize={stats.totalSize}
        uploadedFilesCount={uploadedFiles.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        showMenuButton={true}
      />
      )}

      {/* Main Dashboard Content */}
      <Flex direction="column" p="4" mt="9">
        {/* Stats Cards */}
         <Card 
    variant="surface" 
    style={{ 
      border: 'none',
      background: 'linear-gradient(135deg, var(--mauve-2) 0%, var(--ruby-2) 100%)',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {/* Decorative Elements */}
    <Box
      style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--ruby-5) 0%, transparent 70%)',
        opacity: 0.3
      }}
    />
    <Box
      style={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'linear-gradient(45deg, var(--tomato-5) 0%, transparent 70%)',
        opacity: 0.2
      }}
    />
    
    <Flex direction="column" gap="4" p="5" position="relative">      
      <Grid columns={{ initial: '1', md: '2' }} gap="4">
        <Flex direction="column" gap="3">
          <Text size="4" weight="bold" style={{ color: 'var(--mauve-12)' }}>
            Your Personal Digital Fortress
          </Text>
          <Text size="2" style={{ color: 'var(--mauve-11)', lineHeight: 1.6 }}>
            Store, manage, and share files on the decentralized IPFS network. 
            Every upload is permanently pinned and distributed across Storacha's 
            global node infrastructure.
          </Text>
          <Flex gap="2" wrap="wrap" mt="2">
            <Badge color="ruby" variant="surface" size="1">
              🔒 Permanently Pinned
            </Badge>
            <Badge color="ruby" variant="surface" size="1">
              🌐 IPFS Network
            </Badge>
            <Badge color="ruby" variant="surface" size="1">
              ⚡ Fast Retrieval
            </Badge>
            <Badge color="ruby" variant="surface" size="1">
              🔗 Shareable Links
            </Badge>
          </Flex>
        </Flex>
        
        <Card 
          variant="classic" 
          style={{ 
            background: 'var(--ruby-3)',
            border: '1px solid var(--ruby-6)'
          }}
        >
<Flex direction="column" gap="3">
  <Text size="2" weight="bold" color="ruby">
    Quick Stats
  </Text>
  <Flex direction="column" gap="2">
    <Flex justify="between" align="center">
      <Text size="2" color="gray">Active Connection</Text>
      <Badge color="green" variant="soft" size="1">
        Connected
      </Badge>
    </Flex>
    <Flex justify="between" align="center">
      <Text size="2" color="gray">Network Status</Text>
      <Text size="2" weight="medium" color="ruby">Operational</Text>
    </Flex>
    <Flex justify="between" align="center">
      <Text size="2" color="gray">Space DID</Text>
      <Text size="2" color="ruby" style={{ fontFamily: 'monospace' }}>
        {userSession.spaceDid?.slice(0, 8)}...
      </Text>
    </Flex>
  </Flex>
  
  {/* Buttons in a row */}
  <Flex gap="2" style={{ marginTop: '0.5rem' }}>
    <Button 
      variant="soft" 
      color="ruby" 
      size="1"
      style={{ flex: 1 }}
      onClick={() => window.open('https://docs.storacha.network', '_blank')}
    >
      Learn More
    </Button>

    <Button 
      variant="soft"
      color="ruby" 
      size="1"
      style={{ flex: 1 }}
      onClick={() => window.open('https://yourls.in/storacha', '_blank')}
    >
      Join Storacha
    </Button>
  </Flex>
</Flex>
        </Card>
      </Grid>
    </Flex>
  </Card> 

  {/* Stats Cards */}
<Box mb="4">
  <Flex justify="center" mb="4">
    <Text 
      size="4" 
      weight="bold" 
      style={{ 
        color: 'var(--mauve-12)',
        textAlign: 'center',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      Your Storage Dashboard
      {/* Optional decorative element */}
      <Box
        style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100,
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--ruby-8), transparent)',
          borderRadius: 1
        }}
      />
    </Text>
  </Flex>
  
  <Grid columns={{ initial: '2', md: '4' }} gap="4" mb="6">
    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
      <Flex direction="column" gap="2">
        <Text size="2" color="gray">Active Files</Text>
        <Text size="6" weight="bold" color="ruby">{uploadedFiles.length}</Text>
        <Text size="1" color="gray">Total uploaded</Text>
      </Flex>
    </Card>
    
    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
      <Flex direction="column" gap="2">
        <Text size="2" color="gray">Storage Used</Text>
        <Text size="6" weight="bold" color="tomato">
          {(stats.totalSize / 1024 / 1024).toFixed(1)} MB
        </Text>
        <Text size="1" color="gray">
          {stats.storagePercent.toFixed(1)}% of space used
        </Text>
      </Flex>
    </Card>
    
    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
      <Flex direction="column" gap="2">
        <Text size="2" color="gray">Space DID</Text>
        <Text size="6" weight="bold" color="crimson" style={{ fontFamily: 'monospace' }}>
          {userSession.spaceDid?.slice(0, 6)}...
        </Text>
        <Text size="1" color="gray">Your unique identifier</Text>
      </Flex>
    </Card>
    
    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
      <Flex direction="column" gap="2">
        <Text size="2" color="gray">Status</Text>
        <Badge color="ruby" variant="surface" size="2">
          <LightningBoltIcon /> Active
        </Badge>
        <Text size="1" color="gray">Connected to Storacha</Text>
      </Flex>
    </Card>
  </Grid>
</Box>


  {/* How It Works - Simple Steps */}
<Box mb="6">
  <Flex justify="center" mb="4">
    <Text 
      size="4" 
      weight="bold" 
      style={{ 
        color: 'var(--mauve-12)',
        textAlign: 'center',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      How It Works
      {/* Optional decorative element */}
      <Box
        style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 60,
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--ruby-8), transparent)',
          borderRadius: 1
        }}
      />
    </Text>
  </Flex>
  
  <Grid columns={{ initial: '1', md: '3' }} gap="4" mb="6">
    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
      <Flex direction="column" gap="3">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--ruby-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ruby-9)'
          }}
        >
          <Text size="4" weight="bold">1</Text>
        </Box>
        <Text size="2" weight="bold" style={{ color: 'var(--mauve-12)' }}>
          Upload Files
        </Text>
        <Text size="1" style={{ color: 'var(--mauve-11)' }}>
          Drag & drop or select files to upload. Files are chunked and encrypted.
        </Text>
      </Flex>
    </Card>
    
    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
      <Flex direction="column" gap="3">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--ruby-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ruby-9)'
          }}
        >
          <Text size="4" weight="bold">2</Text>
        </Box>
        <Text size="2" weight="bold" style={{ color: 'var(--mauve-12)' }}>
          Store on IPFS
        </Text>
        <Text size="1" style={{ color: 'var(--mauve-11)' }}>
          Files are distributed across Storacha's global IPFS nodes and permanently pinned.
        </Text>
      </Flex>
    </Card>
    
    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
      <Flex direction="column" gap="3">
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'var(--ruby-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ruby-9)'
          }}
        >
          <Text size="4" weight="bold">3</Text>
        </Box>
        <Text size="2" weight="bold" style={{ color: 'var(--mauve-12)' }}>
          Share & Manage
        </Text>
        <Text size="1" style={{ color: 'var(--mauve-11)' }}>
          Get shareable links, track analytics, and manage your decentralized storage.
        </Text>
      </Flex>
    </Card>
  </Grid>
</Box>

        {/* Tabs Navigation */}
        <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <Tabs.List size="2" style={{ background: 'var(--mauve-3)', borderRadius: 'var(--radius-3)', padding: '4px' }}>
            <Tabs.Trigger value="upload" style={{ borderRadius: 'var(--radius-2)' }}>
              <UploadIcon /> Upload
            </Tabs.Trigger>
            <Tabs.Trigger value="gallery" style={{ borderRadius: 'var(--radius-2)' }}>
              <FileIcon /> Gallery ({uploadedFiles.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="analytics" style={{ borderRadius: 'var(--radius-2)' }}>
              <DashboardIcon /> Analytics
            </Tabs.Trigger>
          </Tabs.List>

          <Box pt="6">
            {/* Upload Tab */}
            <Tabs.Content value="upload">
              <StorachaUpload 
                onUploadComplete={handleUploadComplete}
                isConnected={isConnected}
                userEmail={userSession.email}
                spaceDid={userSession.spaceDid}
                onUpload={uploadFiles}
                uploadProgress={uploadProgress}
                formatFileSize={formatFileSize}
              />
            </Tabs.Content>

            {/* Gallery Tab */}
            <Tabs.Content value="gallery">
              <Card style={{ borderColor: 'var(--ruby-6)' }}>
                <Flex direction="column" gap="4">
                  <Flex justify="between" align="center" wrap="wrap" gap="3">
                    <Flex gap="3" align="center" style={{ flex: 1, minWidth: '300px' }}>
                      <TextField.Root
                        placeholder="Search files..."
                        size="2"
                        style={{ flex: 1, maxWidth: '400px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      >
                        <TextField.Slot>
                          <MagnifyingGlassIcon />
                        </TextField.Slot>
                      </TextField.Root>
                      
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <Button variant="soft" size="2">
                            <MixerHorizontalIcon /> Filter
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          <DropdownMenu.Item onClick={() => setFilterTag('all')}>All Files</DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item onClick={() => setFilterTag('image')}><ImageIcon /> Images</DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => setFilterTag('video')}><VideoIcon /> Videos</DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => setFilterTag('document')}><FileTextIcon /> Documents</DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Flex>

                    <Flex gap="2">
                      <IconButton
                        variant={viewMode === 'grid' ? 'ghost' : 'ghost'}
                        onClick={() => setViewMode('grid')}
                        size="2"
                        style={{marginRight: '2px'}}
                      >
                        <ImageIcon />
                      </IconButton>
                      <IconButton
                        variant={viewMode === 'list' ? 'ghost' : 'ghost'}
                        onClick={() => setViewMode('list')}
                        size="2"
                        style={{marginRight: '2px'}}
                      >
                        < ListBulletIcon/>
                      </IconButton>

                      {uploadedFiles.length > 0 && (
                        <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                          <AlertDialog.Content maxWidth="450px">
                            <AlertDialog.Title>Clear All Files?</AlertDialog.Title>
                            <AlertDialog.Description size="2">
                              This will remove all files from your local history. Your files will remain on IPFS.
                            </AlertDialog.Description>
                            <Flex gap="3" mt="4" justify="end">
                              <AlertDialog.Cancel>
                                <Button variant="soft" color="gray">Cancel</Button>
                              </AlertDialog.Cancel>
                              <AlertDialog.Action>
                                <Button variant="solid" color="ruby" onClick={clearUploads}>Clear All</Button>
                              </AlertDialog.Action>
                            </Flex>
                          </AlertDialog.Content>
                        </AlertDialog.Root>
                      )}
                    </Flex>
                  </Flex>

                  <FileGallery 
                    files={uploadedFiles}
                    filterType={filterTag}
                    searchQuery={searchQuery}
                    onClear={clearUploads}
                    getShareableLink={(cid, fileName) => `https://${cid}.ipfs.storacha.link${fileName ? `/${encodeURIComponent(fileName)}` : ''}`}
                    formatFileSize={formatFileSize}
                    viewMode={viewMode}
                  />
                </Flex>
              </Card>
            </Tabs.Content>

            {/* Analytics Tab */}
            <Tabs.Content value="analytics">
              <Card style={{ borderColor: 'var(--ruby-6)' }}>
                <Flex direction="column" gap="6">
                  <Text size="5" weight="bold">Analytics</Text>
                  
                  <Grid columns={{ initial: '1', md: '2' }} gap="4">
                    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
                      <Flex direction="column" gap="3">
                        <Text size="3" weight="bold">File Types</Text>
                        <Flex direction="column" gap="2">
                          {Object.entries(stats.fileTypes).map(([type, count]) => (
                            <Flex key={type} justify="between" align="center" p="2">
                              <Text size="2" style={{ textTransform: 'capitalize' }}>
                                {type === 'image' ? 'Images' : type === 'video' ? 'Videos' : type === 'application' ? 'Documents' : type}
                              </Text>
                              <Text size="2" weight="medium">{count}</Text>
                            </Flex>
                          ))}
                        </Flex>
                      </Flex>
                    </Card>

                    <Card variant="surface" style={{ borderColor: 'var(--ruby-6)' }}>
                      <Flex direction="column" gap="3">
                        <Text size="3" weight="bold">Storage Overview</Text>
                        <Flex direction="column" gap="3">
                          <Box>
                            <Flex justify="between" mb="1">
                              <Text size="1" color="gray">Used Space</Text>
                              <Text size="1" weight="medium" color="ruby">
                                {(stats.totalSize / 1024 / 1024).toFixed(2)} MB
                              </Text>
                            </Flex>
                            <Progress value={stats.storagePercent} size="2" color="ruby" />
                          </Box>
                        </Flex>
                      </Flex>
                    </Card>
                  </Grid>
                </Flex>
              </Card>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>

      <CreativeFooter
      isDarkTheme={isDarkTheme} 
      onThemeToggle={onThemeToggle}
    />
    </Box>
  );

};
