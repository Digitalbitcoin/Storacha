import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Card,
  TextField,
  Badge,
  Checkbox,
  AlertDialog
} from '@radix-ui/themes';
import {
  EnvelopeClosedIcon,
  InfoCircledIcon,
  CheckIcon
} from '@radix-ui/react-icons';
import { FlameIcon } from 'lucide-react';

interface EmailLoginProps {
  onLogin: (email: string, referralCode: string) => Promise<{ success: boolean; error?: string }>;
  onSwitchToDelegation?: () => void;
  isLoading?: boolean;
  referralCode?: string;
}

export const EmailLogin: React.FC<EmailLoginProps> = ({ 
  onLogin, 
  onSwitchToDelegation,
  isLoading = false,
  referralCode = 'QFJT8CgjTcL6Twwk' // Your referral code
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!agreedToTerms) {
      setError('Please agree to the terms to continue');
      return;
    }
    
    // Call onLogin with both email AND referral code
    const result = await onLogin(email, referralCode);
    
    if (!result.success) {
      setError(result.error || 'Failed to process email');
      return;
    }
    
    // Show success message instead of redirecting
    setShowSuccess(true);
    setEmail(''); // Clear email field
    setAgreedToTerms(false); // Reset checkbox
  };

  return (
    <>
      <Card size="4" style={{ maxWidth: '600px', width: '100%' }}>
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2" align="center">    
            <Text size="5" weight="bold">Get Started with Storacha</Text>
            <Text size="2" color="gray" align="center">
              Sign up for decentralized IPFS storage
            </Text>       
          </Flex>

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              {/* Email Field */}
              <TextField.Root
                size="3"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null); // Clear error when typing
                }}
                type="email"
                disabled={isLoading}
                required
              >
                <TextField.Slot>
                  <EnvelopeClosedIcon color="var(--ruby-9)" />
                </TextField.Slot>
              </TextField.Root>

              {/* Terms Agreement */}
              <Flex align="center" gap="2">
                <Checkbox 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  disabled={isLoading}
                />
                <Text size="2">
                  I agree to receive a verification email from Storacha and accept their{' '}
                  <a 
                    href="https://docs.storacha.network/terms/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--ruby-9)', textDecoration: 'underline' }}
                  >
                    Terms & Conditions
                  </a>
                </Text>
              </Flex>

              {error && (
                <Badge color="ruby" variant="surface">
                  <InfoCircledIcon /> {error}
                </Badge>
              )}

              <Button 
                size="3" 
                type="submit"
                disabled={isLoading || !email.trim() || !agreedToTerms}
                style={{ 
                  background: 'linear-gradient(135deg, var(--ruby-9) 0%, var(--tomato-9) 100%)',
                  color: 'white',
                }}
              >
                {isLoading ? (
                  <>
                    <Box
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid',
                        borderColor: 'currentColor transparent transparent transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}
                    />
                    Sending Verification...
                  </>
                ) : (
                  <>
                    <FlameIcon style={{ marginRight: '8px' }} /> 
                    Send Verification Email
                  </>
                )}
              </Button>

              {/* What happens next - Updated for email verification */}
              <Card variant="surface" size="1">
                <Flex direction="column" gap="1">
                  <Text size="1" weight="bold">What happens next:</Text>
                  <Text size="1">1. Your email will be sent to Storacha</Text>
                  <Text size="1">2. Storacha will send you a verification email</Text>
                  <Text size="1">3. Click the link in the email to activate your account</Text>
                  <Text size="1">4. Return here and login with your new account</Text>
                </Flex>
              </Card>
            </Flex>
          </form>

          {/* Alternative login option */}
          {onSwitchToDelegation && (
            <Flex direction="column" gap="2" align="center">
              <Text size="1" color="gray">Already have a Storacha account?</Text>
              <Button 
                variant="ghost" 
                size="2"
                onClick={onSwitchToDelegation}
              >
                Use Delegation Token Instead
              </Button>
            </Flex>
          )}

          {/* Privacy note */}
          <Text size="1" color="gray" align="center">
            Your email will be sent to Storacha for verification.
            No redirects needed - you'll receive an email directly from Storacha.
          </Text>
        </Flex>
      </Card>

      {/* Success Dialog */}
      <AlertDialog.Root open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialog.Content maxWidth="450px">
          <Flex direction="column" gap="4" align="center">
            <Box
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--green-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--green-11)'
              }}
            >
              <CheckIcon width="32" height="32" />
            </Box>
            
            <AlertDialog.Title>Verification Email Sent!</AlertDialog.Title>
            
            <AlertDialog.Description size="2">
              Your email have been sent to Storacha.
            </AlertDialog.Description>
            
            <Box
              style={{
                padding: '12px',
                background: 'var(--mauve-2)',
                borderRadius: 'var(--radius-2)',
                border: '1px solid var(--mauve-6)',
                width: '100%'
              }}
            >
              <Flex direction="column" gap="2">
                <Text size="1" weight="bold">Next Steps:</Text>
                <Text size="1">1. Check your email inbox (and spam folder)</Text>
                <Text size="1">2. Look for an email from Storacha</Text>
                <Text size="1">3. Click the verification link in the email</Text>
                <Text size="1">4. Your account will be created with referral code: <code style={{ color: 'var(--ruby-9)' }}>{referralCode}</code></Text>
              </Flex>
            </Box>
            
            <Flex gap="2" justify="end" mt="2" style={{ width: '100%' }}>
              <AlertDialog.Cancel>
                <Button variant="soft" color="gray">Got it</Button>
              </AlertDialog.Cancel>
            </Flex>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};
