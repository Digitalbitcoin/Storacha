import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Separator,
  Link,
  Badge,
  Grid
} from '@radix-ui/themes';
import {
  GitHubLogoIcon,
  TwitterLogoIcon,
  DiscordLogoIcon,
  LightningBoltIcon,
  GlobeIcon,
  RocketIcon,
  CubeIcon,
  CodeIcon,
  LockClosedIcon,
  
} from '@radix-ui/react-icons';
import Subscription from '../Subscription';


interface FooterProps {
  isDarkTheme: boolean;
  onThemeToggle?: () => void;
}

export const CreativeFooter: React.FC<FooterProps> = ({ isDarkTheme }) => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      style={{
        background: isDarkTheme 
          ? 'linear-gradient(180deg, var(--mauve-1) 0%, var(--mauve-3) 100%)'
          : 'linear-gradient(180deg, var(--mauve-2) 0%, var(--mauve-4) 100%)',        
        position: 'relative',
        overflow: 'hidden',
        marginTop: 'auto'
      }}
    >
      {/* Decorative background elements */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, var(--red-4) 0%, transparent 50%)',
          opacity: 0.1,
          pointerEvents: 'none'
        }}
      />
      
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, var(--tomato-4) 0%, transparent 50%)',
          opacity: 0.1,
          pointerEvents: 'none'
        }}
      />

      <Box p={{ initial: '6', sm: '8' }} style={{ position: 'relative', zIndex: 1 }}>
        {/* Main footer content */}
        <Grid columns={{ initial: '1', sm: '2', md: '4' }} gap="6" mb="6">
          {/* Brand column */}
          <Flex direction="column" gap="4">
            <Flex gap="3" align="center">
              <Box
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: '#e91315',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'white',
                }}
              >
                🔥
              </Box>
              <Flex direction="column">
                <Text size="5" weight="bold" style={{ color: 'var(--mauve-12)' }}>
                  Storacha Vault
                </Text>
                <Badge color="red" variant="surface" size="1">
                  <LightningBoltIcon /> Powered by IPFS
                </Badge>
              </Flex>
            </Flex>
            
            <Text size="2" color="gray" style={{ lineHeight: '1.6' }}>
              Secure, decentralized storage for the future. 
              Built with cutting-edge Web3 technology and 
              passionate about data sovereignty.
            </Text>
            
            <Flex gap="5">
              <IconButton
                variant="ghost"
                style={{ color: 'var(--red-9)' }}
                size="2"
                asChild
              >
                <a href="https://github.com/storacha/" target="_blank" rel="noopener noreferrer">
                  <GitHubLogoIcon />
                </a>
              </IconButton>
              <IconButton
                variant="ghost"
                style={{ color: 'var(--red-9)' }}
                size="2"
                asChild
              >
                <a href="https://x.com/storachanetwork/" target="_blank" rel="noopener noreferrer">
                  <TwitterLogoIcon />
                </a>
              </IconButton>
              <IconButton
                variant="ghost"
                style={{ color: 'var(--red-9)' }}
                size="2"
                asChild
              >
                <a href="https://discord.gg/s6YuTenJTQ" target="_blank" rel="noopener noreferrer">
                  <DiscordLogoIcon />
                </a>
              </IconButton>
            </Flex>
          </Flex>

          {/* Features column */}
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold" style={{ color: 'var(--mauve-12)' }}>
              Core Features
            </Text>
            <Flex direction="column" gap="3">
              {[
                { icon: <LockClosedIcon />, label: 'Zero-Knowledge Encryption' },
                { icon: <CubeIcon />, label: 'Distributed Storage' },
                { icon: <LightningBoltIcon />, label: 'Blazing Fast Access' },
                { icon: <RocketIcon />, label: 'Scalable Infrastructure' }
              ].map((feature, index) => (
                <Flex key={index} gap="2" align="center">
                  <Box style={{ color: 'var(--red-9)' }}>
                    {feature.icon}
                  </Box>
                  <Text size="2" color="gray">{feature.label}</Text>
                </Flex>
              ))}
            </Flex>
          </Flex>

          {/* Quick Links column */}
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold" style={{ color: 'var(--mauve-12)' }}>
              Quick Links
            </Text>
            <Flex direction="column" gap="2">
              <Link 
                href="https://docs.storacha.network/"
                target='_blank'
                size="2" 
                color="gray"
              >
                Documentation
              </Link>
              <Link 
                href="https://storacha.network/ecosystem" 
                target='_blank'
                size="2" 
                color="gray"
              >
                Ecosystem
              </Link>
              <Link 
                href="https://console.storacha.network/plans" 
                target='_blank'
                size="2" 
                color="gray"
              >
                Pricing
              </Link>
              <Link 
                href="https://storacha.network/blog" 
                target='_blank'
                size="2" 
                color="gray"               
              >
                Blog & Updates
              </Link>
              <Link 
                href="mailto:support@storacha.network" 
                size="2" 
                color="gray"               
              >
                Support
              </Link>
            </Flex>
          </Flex>

          {/* Newsletter column */}
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold" style={{ color: 'var(--mauve-12)' }}>
              Stay Updated
            </Text>
            <Text size="2" color="gray">
              Get the latest updates on new features and releases.
            </Text>
            
             <Subscription/>
          </Flex>
        </Grid>

        <Separator size="4" mb="6" />

        {/* Bottom row */}
        <Flex 
          direction={{ initial: 'column', sm: 'row' }} 
          justify="between" 
          align="center" 
          gap="4"
        >
          <Flex direction="column" gap="2" align={{ initial: 'center', sm: 'start' }}>
            <Text size="1" color="gray">
              © {currentYear} Storacha Vault. All rights reserved.
            </Text>
          </Flex>

          <Flex gap="2" align="center">     
            <Badge color="red" variant="surface" size="1">
              <CodeIcon /> Open Source
            </Badge>
            
            <Badge color="tomato" variant="surface" size="1">
              <GlobeIcon /> Decentralized
            </Badge>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
