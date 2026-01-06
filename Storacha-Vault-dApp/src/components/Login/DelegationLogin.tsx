import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Card,
  Button,
  TextField,
  Badge
} from '@radix-ui/themes';
import {
  ChevronLeftIcon,
  InfoCircledIcon
} from '@radix-ui/react-icons';
import { FlameIcon, KeyIcon } from 'lucide-react';

interface DelegationLoginProps {
  onLogin: (config: { key: string; proof: string; spaceDid?: string }) => 
    Promise<{ success: boolean; error?: string }>;
  onBack?: () => void;
  isLoading?: boolean;
}

export const DelegationLogin: React.FC<DelegationLoginProps> = ({ 
  onLogin, 
  onBack,
  isLoading = false
}) => {
  const [key, setKey] = useState('');
  const [proof, setProof] = useState('');
  const [spaceDid, setSpaceDid] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!key.trim() || !proof.trim()) {
      setError('Please enter both key and proof');
      return;
    }
    
    const result = await onLogin({
      key: key.trim(),
      proof: proof.trim(),
      spaceDid: spaceDid.trim() || undefined
    });
    
    if (!result.success) {
      setError(result.error || 'Delegation login failed');
    }
  };

  return (
    <Card size="4" style={{ maxWidth: '600px', width: '100%' }}>
      <Flex direction="column" gap="4">
        {onBack && (
          <Button 
            variant="ghost" 
            size="1"
            onClick={onBack}
            style={{ alignSelf: 'flex-start' }}
          >
            <ChevronLeftIcon /> Back to Email Login
          </Button>
        )}

        <Flex direction="column" gap="2">
          <Flex gap="2" align="center">
            <KeyIcon />
            <Text size="5" weight="bold">Delegation Login</Text>
          </Flex>
          <Text size="2" color="gray">
            For serverless functions and backend services
          </Text>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">Agent Private Key</Text>
              <TextField.Root
                placeholder="MgCZVG9sRWRRdyDMxcaKyRaR1rnWjCb022gQukvzYXa4ud+0BD3ZIT3YsNhDL3sJQcGm8H4j65EJVGvH1C8N9RaVSEP8="
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
                style={{fontSize:'9.5px'}}
                disabled={isLoading}
              />
              <Text size="1" color="gray">
                Your agent's private key (starts with "Mg...")
              </Text>
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">UCAN Proof (Base64)</Text>
              <textarea
                placeholder="Base64 encoded UCAN delegation..."
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                required
                disabled={isLoading}
                rows={5}
                style={{
                  width: '100%',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-2)',
                  border: '1px solid var(--gray-6)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  resize: 'vertical'
                }}
              />
              <Text size="1" color="gray">
                UCAN delegation proving your permissions
              </Text>
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold">Space DID (Optional)</Text>
              <TextField.Root
                placeholder="did:key:z6MkoRtHru6hTN2EGN2nrXWKwfqTe5MjuBCv8VYAndSYeXdM"
                value={spaceDid}
                onChange={(e) => setSpaceDid(e.target.value)}
                disabled={isLoading}
              />
              <Text size="1" color="gray">
                Specific Space DID to connect to
              </Text>
            </Flex>

            {error && (
              <Badge color="red" variant="surface">
                <InfoCircledIcon /> {error}
              </Badge>
            )}

            <Flex direction="column" gap="2">              
              <Button
                type="submit"
                size="3" 
                disabled={isLoading || !key || !proof}
                variant="solid"
              >
                {isLoading ? (
                  <>
                    <Box
                      style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid',
                        borderColor: 'currentColor transparent transparent transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                    Connecting...
                  </>
                ) : (
                  <>
                     <FlameIcon />  Connect to Storach Vault
                  </>
                )}
              </Button>
            </Flex>
          </Flex>
        </form>

        <Card variant="surface">
          <Flex direction="column" gap="2">
            <Text size="2" weight="bold">How to get these credentials:</Text>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
              <li>Use CLI: <code>storacha key create</code> for private key</li>
              <li>Use CLI: <code>storacha delegation create [audience-did] --base64</code> for proof</li>
              <li>Use CLI: <code>storacha space ls</code> for Space DID</li>
            </ol>
            <Text size="1" color="gray" mt="2">
              This method is ideal for serverless functions and backend services.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Card>
  );
};
