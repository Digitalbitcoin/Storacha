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
  onLogin?: (email: string, referralCode: string) => Promise<{ success: boolean; error?: string }>;
  onSwitchToDelegation?: () => void;
  isLoading?: boolean;
  referralCode?: string;
}

export const EmailLogin: React.FC<EmailLoginProps> = ({ 
  onLogin, 
  onSwitchToDelegation,
  isLoading = false,
  referralCode = 'QFJT8CgjTcL6Twwk'
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!agreedToTerms) {
      setError('Please agree to the terms to continue');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);

    try {
      // Option 1: If onLogin prop is provided, use it
      if (onLogin) {
        const result = await onLogin(email, referralCode);
        
        if (!result.success) {
          setError(result.error || 'Failed to process email');
          return;
        }
      } 
      // Option 2: Direct API call to Storacha endpoint
      else {
        // Create form data
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('refcode', referralCode);

        // Send to Storacha endpoint
        const response = await fetch('https://console.storacha.network/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: formData.toString(),
          mode: 'cors',
        });

        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          
          try {
            const errorData = await response.text();
            if (errorData) {
              errorMessage = errorData;
            }
          } catch (e) {
            // If we can't parse error text, use default message
          }
          
          throw new Error(errorMessage);
        }

        // Check content type and parse response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Storacha response:', data);
        } else {
          const text = await response.text();
          console.log('Storacha response:', text);
        }
      }

      // Success handling
      setShowSuccess(true);
      setEmail('');
      setAgreedToTerms(false);
      
    } catch (err: any) {
      console.error('Storacha signup error:', err);
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle direct redirect to Storacha (alternative approach)
  const handleDirectStorachaSignup = () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms to continue');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Encode parameters
    const encodedEmail = encodeURIComponent(email);
    const encodedRefcode = encodeURIComponent(referralCode);
    
    // Redirect to Storacha with both email and refcode
    const storachaUrl = `https://console.storacha.network/?email=${encodedEmail}&refcode=${encodedRefcode}`;
    window.open(storachaUrl, '_blank', 'noopener,noreferrer');
    
    // Show success message
    setShowSuccess(true);
    setEmail('');
    setAgreedToTerms(false);
  };

  const isSubmitDisabled = isProcessing || !email.trim() || !agreedToTerms;
  const showLoading = isLoading || isProcessing;

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
                  setError(null);
                }}
                type="email"
                disabled={showLoading}
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
                  disabled={showLoading}
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

              {/* Error Message */}
              {error && (
                <Badge color="ruby" variant="surface">
                  <InfoCircledIcon /> {error}
                </Badge>
              )}

              {/* Primary Submit Button */}
              <Button 
                size="3" 
                type="submit"
                disabled={isSubmitDisabled || showLoading}
                variant="solid"
              >
                {showLoading ? (
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
                    <FlameIcon /> 
                    Send Verification Email
                  </>
                )}
              </Button>

              {/* Alternative: Direct redirect button */}
              <Button 
                type="button"
                variant="soft"
                size="3"
                onClick={handleDirectStorachaSignup}
                disabled={isSubmitDisabled || showLoading}
              >
                Or signup to Storacha directly
              </Button>

              {/* What happens next */}
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
                disabled={showLoading}
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
              Your email has been sent to Storacha.
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
                <Text size="1">4. Your account will be created with provided email</Text>
                <Text size="1" style={{ fontStyle: 'italic', color: 'var(--gray-11)' }}>
                  Note: You may need to return to this site to complete setup.
                </Text>
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

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

// Example usage in a parent component
export const ExampleParentComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (_email: string, _referralCode: string) => {
    setIsLoading(true);
    
    try {
      // You can implement custom logic here
      // Or just call the Storacha API directly
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToDelegation = () => {
    console.log('Switch to delegation login');
    // Implement delegation login logic
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <EmailLogin
        onLogin={handleLogin}
        onSwitchToDelegation={handleSwitchToDelegation}
        isLoading={isLoading}
        referralCode="QFJT8CgjTcL6Twwk"
      />
    </div>
  );
};
