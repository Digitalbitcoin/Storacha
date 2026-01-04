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
  CopyIcon,
  ChevronLeftIcon,
  InfoCircledIcon,
  LockOpen1Icon
} from '@radix-ui/react-icons';
import { KeyIcon } from 'lucide-react';

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

  const handleCopyExample = () => {
    const exampleKey = `MgCZVG9sRWRRdyDMxcaKyRaR1rnWjCb022gQukvzYXa4ud+0BD3ZIT3YsNhDL3sJQcGm8H4j65EJVGvH1C8N9RaVSEP8=`;
    const exampleProof = `mAYIEAKwVOqJlcm9vdHOB2CpYJQABcRIgzrZtcu/t9ZSjjl6twf8Nexzz6QC22wGUvOeT2XxMVOVndmVyc2lvbgG5BwFxEiCY3ivYicERnAM0j77EOIMpbW3C4LuPLsxqEb8hegNW0ahhc1hE7aEDQOWqF6s+aJs+zGh7B1h012EfQ2BJ6tR6eo2LVkAt5G3TMk65PBnMBC1t4UTYWgkCy81XJh3qsFKulhNWXdBi9whhdmUwLjkuMWNhdHSJomNjYW5oYXNzZXJ0Lypkd2l0aHg4ZGlkOmtleTp6Nk1rb1J0SHJ1NmhUTjJFR04ybnJYV0t3ZnFUZTVNanVCQ3Y4VllBbmRTWWVYZE2iY2NhbmdzcGFjZS8qZHdpdGh4OGRpZDprZXk6ejZNa29SdEhydTZoVE4yRUdOMm5yWFdLd2ZxVGU1TWp1QkN2OFZZQW5kU1llWGRNomNjYW5mYmxvYi8qZHdpdGh4OGRpZDprZXk6ejZNa29SdEhydTZoVE4yRUdOMm5yWFdLd2ZxVGU1TWp1QkN2OFZZQW5kU1llWGRNomNjYW5naW5kZXgvKmR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTaJjY2FuZ3N0b3JlLypkd2l0aHg4ZGlkOmtleTp6Nk1rb1J0SHJ1NmhUTjJFR04ybnJYV0t3ZnFUZTVNanVCQ3Y4VllBbmRTWWVYZE2iY2Nhbmh1cGxvYWQvKmR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTaJjY2FuaGFjY2Vzcy8qZHdpdGh4OGRpZDprZXk6ejZNa29SdEhydTZoVE4yRUdOMm5yWFdLd2ZxVGU1TWp1QkN2OFZZQW5kU1llWGRNomNjYW5qZmlsZWNvaW4vKmR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTaJjY2FuZ3VzYWdlLypkd2l0aHg4ZGlkOmtleTp6Nk1rb1J0SHJ1NmhUTjJFR04ybnJYV0t3ZnFUZTVNanVCQ3Y4VllBbmRTWWVYZE1jYXVkWCLtAbEoAJh3lWOPVXD7uqK38WQV/WkFTYdmnB3WgEOBAW1BY2V4cBprKDXoY2ZjdIGhZXNwYWNlomRuYW1laSBteS1zcGFjZWZhY2Nlc3OhZHR5cGVmcHVibGljY2lzc1gi7QGFXwEVxBgzkkmo9EX7RoXFw8WRWDX8n4prJRMdcKVsTGNwcmaAuQcBcRIgsFE/DNZ3LrXx7oXH9+BXB7XQVjMNqk0tFjkoNhxckYOoYXNYRO2hA0DheLksD38Jz+kGUF12ol3GA726R/tGIaROoABg1g5C1YL25eRJPx8dSVkbpqgqextqmuL2NOr9IfqCxrXIqTEJYXZlMC45LjFjYXR0iaJjY2FuaGFzc2VydC8qZHdpdGh4OGRpZDprZXk6ejZNa29SdEhydTZoVE4yRUdOMm5yWFdLd2ZxVGU1TWp1QkN2OFZZQW5kU1llWGRNomNjYW5nc3BhY2UvKmR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTaJjY2FuZmJsb2IvKmR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTaJjY2FuZ2luZGV4Lypkd2l0aHg4ZGlkOmtleTp6Nk1rb1J0SHJ1NmhUTjJFR04ybnJYV0t3ZnFUZTVNanVCQ3Y4VllBbmRTWWVYZE2iY2NhbmdzdG9yZS8qZHdpdGh4OGRpZDprZXk6ejZNa29SdEhydTZoVE4yRUdOMm5yWFdLd2ZxVGU1TWp1QkN2OFZZQW5kU1llWGRNomNjYW5odXBsb2FkLypkd2l0aHg4ZGlkOmtleTp6Nk1rb1J0SHJ1NmhUTjJFR04ybnJYV0t3ZnFUZTVNanVCQ3Y4VllBbmRTWWVYZE2iY2NhbmhhY2Nlc3MvKmR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTaJjY2FuamZpbGVjb2luLypkd2l0aHg4ZGlkOmtleTp6Nk1rb1J0SHJ1NmhUTjJFR04ybnJYV0t3ZnFUZTVNanVCQ3Y4VllBbmRTWWVYZE2iY2Nhbmd1c2FnZS8qZHdpdGh4OGRpZDprZXk6ejZNa29SdEhydTZoVE4yRUdOMm5yWFdLd2ZxVGU1TWp1QkN2OFZZQW5kU1llWGRNY2F1ZFgi7QGxKACYd5Vjj1Vw+7qit/FkFf1pBU2HZpwd1oBDgQFtQWNleHAaayg2K2NmY3SBoWVzcGFjZaJkbmFtZWkgbXktc3BhY2VmYWNjZXNzoWR0eXBlZnB1YmxpY2Npc3NYIu0BhV8BFcQYM5JJqPRF+0aFxcPFkVg1/J+KayUTHXClbExjcHJmgJ8FAXESIEua+Z+tIXqGX7QAlw03mbgWWEu5vHXipBw43fJ+AAh4qGFzWETtoQNASwQrHArcNAeqSAQbpYacc5TW8v71JMRR0N8KNQMvXQcgCNhsaiHVHPHZAuMWbXtNoJsUzoodTR4D9WI5nCjlD2F2ZTAuOS4xY2F0dISiY2Nhbm5zcGFjZS9ibG9iL2FkZGR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTaJjY2Fub3NwYWNlL2luZGV4L2FkZGR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTaJjY2FubmZpbGVjb2luL29mZmVyZHdpdGh4OGRpZDprZXk6ejZNa29SdEhydTZoVE4yRUdOMm5yWFdLd2ZxVGU1TWp1QkN2OFZZQW5kU1llWGRNomNjYW5qdXBsb2FkL2FkZGR3aXRoeDhkaWQ6a2V5Ono2TWtvUnRIcnU2aFROMkVHTjJuclhXS3dmcVRlNU1qdUJDdjhWWUFuZFNZZVhkTWNhdWRYIu0BD3ZIT3YsNhDL3sJQcGm8H4j65EJVGvH1C8N9RaVSEP9jZXhw9mNmY3SBoWVzcGFjZaJkbmFtZWkgbXktc3BhY2VmYWNjZXNzoWR0eXBlZnB1YmxpY2Npc3NYIu0BsSgAmHeVY49VcPu6orfxZBX9aQVNh2acHdaAQ4EBbUFjcHJmgtgqWCUAAXESIJjeK9iJwRGcAzSPvsQ4gyltbcLgu48uzGoRvyF6A1bR2CpYJQABcRIgsFE/DNZ3LrXx7oXH9+BXB7XQVjMNqk0tFjkoNhxckYNZAXESIM62bXLv7fWUo45ercH/DXsc8+kAttsBlLznk9l8TFTloWp1Y2FuQDAuOS4x2CpYJQABcRIgS5r5n60heoZftACXDTeZuBZYS7m8deKkHDjd8n4ACHg`;
    
    setKey(exampleKey);
    setProof(exampleProof);
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

            <Flex gap="3">
              <Button
                type="button"
                variant="soft"
                size="2"
                onClick={handleCopyExample}
                disabled={isLoading}
              >
                <CopyIcon /> Load Example
              </Button>
              
              <Button
                type="submit"
                size="2"
                disabled={isLoading || !key || !proof}
                style={{ 
                  flex: 1,
                  background: 'linear-gradient(135deg, var(--ruby-9) 0%, var(--tomato-9) 100%)',
                  color: 'white',
                }}
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
                    <LockOpen1Icon /> Connect
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
