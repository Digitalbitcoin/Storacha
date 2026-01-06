import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  IconButton,
  Tooltip,
  Progress
} from '@radix-ui/themes';
import {
  CheckIcon,
  ExitIcon,
  SunIcon,
  MoonIcon,
} from '@radix-ui/react-icons';

interface NavigationBarProps {
  isDarkTheme: boolean;
  onThemeToggle: () => void;
  onLogout: () => void;
  userEmail: string;
  storagePercent: number;
  totalSize: number;
  uploadedFilesCount: number;
  activeTab?: 'upload' | 'gallery' | 'analytics';
  onTabChange?: (tab: 'upload' | 'gallery' | 'analytics') => void;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  isDarkTheme,
  onThemeToggle,
  onLogout,
  userEmail,
  storagePercent,
  totalSize,
  uploadedFilesCount
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      p={{ initial: '3', sm: '4' }}
      px={{ initial: '4', sm: '5' }}
      mb={{ initial: '3', sm: '4' }}
      style={{
        position: 'fixed',
        top: 0,
        padding: "5px 10px",
        zIndex: 50,
        width: '100%',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
        // Add a semi-transparent background based on theme when scrolled
        backgroundColor: isScrolled 
          ? isDarkTheme 
            ? 'rgba(25, 25, 25, 0.7)'
            : 'rgba(255, 255, 255, 0.7)'
          : 'transparent'      
      }}
    >
      <Flex justify="between" align="center" wrap="wrap" gap="3">
        {/* Left side: Logo and branding */}
        <Flex gap={{ initial: '2', sm: '4' }} align="center" style={{ flexShrink: 0 }}>
          {/* Logo - Added hover effect */}
          <Box
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: '#e91315',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: 'white',
              flexShrink: 0,
              cursor: 'pointer',
              transform: isScrolled ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.3s ease',
              filter: isScrolled ? 'saturate(1.2)' : 'saturate(1)'
            }}
            className="nav-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            🔥
          </Box>
          
          {/* Branding */}
          <Flex direction="column">
            <Text 
              size={{ initial: '5', sm: '6', md: '7' }} 
              weight="bold" 
              style={{ 
                color: 'var(--mauve-12)',
                // Add gradient text effect when scrolled
                background: isScrolled
                  ? isDarkTheme
                    ? 'linear-gradient(135deg, var(--ruby-9) 0%, var(--tomato-9) 100%)'
                    : 'linear-gradient(135deg, var(--ruby-9) 0%, var(--tomato-9) 100%)'
                  : 'none',
                WebkitBackgroundClip: isScrolled ? 'text' : 'none',
                WebkitTextFillColor: isScrolled ? 'transparent' : 'var(--mauve-12)',
                backgroundClip: isScrolled ? 'text' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Storacha Vault
            </Text>
            <Flex gap="2" align="center" wrap="wrap">
              <Badge 
                color="ruby" 
                variant="solid" 
                size="1" 
                radius="full"
                style={{
                  opacity: isScrolled ? 0.9 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              >
                <CheckIcon /> Connected
              </Badge>
              <Box display={{ initial: 'none', md: 'block' }}>
                <Text 
                  size="1" 
                  color="gray"
                  style={{ 
                    maxWidth: '250px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    opacity: isScrolled ? 0.8 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {userEmail}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>

        {/* Desktop Actions (Hidden on mobile) */}
        <Flex 
          gap="3" 
          align="center" 
          display={{ initial: 'none', sm: 'flex' }}
          style={{ flexShrink: 0 }}
        >
          <Tooltip content={`${(totalSize / 1024 / 1024).toFixed(2)} MB used (${uploadedFilesCount} files)`}>
            <Box style={{ width: '140px' }}>
              <Flex justify="between" mb="1">
                <Text 
                  size="1" 
                  color="gray"
                  style={{
                    opacity: isScrolled ? 0.8 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  Storage
                </Text>
                <Text 
                  size="1" 
                  weight="medium" 
                  color="ruby"
                  style={{
                    opacity: isScrolled ? 0.9 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {storagePercent.toFixed(1)}%
                </Text>
              </Flex>
              <Progress 
                value={storagePercent} 
                style={{ 
                  background: isDarkTheme ? 'var(--mauve-4)' : 'var(--mauve-3)',
                  opacity: isScrolled ? 0.9 : 1,
                  transition: 'all 0.3s ease'
                }}
                color="ruby"
                size="1"
              />
            </Box>
          </Tooltip>          
        </Flex>

        {/* Right side: Mobile actions */}
        <Flex 
          gap="3" 
          align="center" 
          style={{ flexShrink: 0 }}
        >
          {/* Desktop Theme Toggle (visible on sm and above) */}
          <IconButton
            variant="ghost"
            onClick={onThemeToggle}
            style={{ 
              color: 'var(--ruby-9)',
              // Add background blur effect for buttons
              backdropFilter: isScrolled ? 'blur(4px)' : 'none',
              WebkitBackdropFilter: isScrolled ? 'blur(4px)' : 'none',
              backgroundColor: isScrolled 
                ? isDarkTheme 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)'
                : 'transparent',
              transition: 'all 0.3s ease'
            }}
            size="2"
            aria-label="Toggle theme"        
          >
            {isDarkTheme ? <SunIcon /> : <MoonIcon />}
          </IconButton>

          {/* Desktop Logout (visible on sm and above) */}
          <Button 
            variant="soft" 
            color="ruby" 
            onClick={onLogout}
            size="2"
            aria-label="Disconnect"
            style={{
              // Add background blur effect for buttons
              backdropFilter: isScrolled ? 'blur(4px)' : 'none',
              WebkitBackdropFilter: isScrolled ? 'blur(4px)' : 'none',
              backgroundColor: isScrolled 
                ? isDarkTheme 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)'
                : undefined,
              transition: 'all 0.3s ease'
            }}
          >
            <ExitIcon /> <Box as="span" display={{ initial: 'none', md: 'inline' }}>Disconnect</Box>
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};