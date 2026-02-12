import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLazyQuery, useMutation, useAuth } from '@animaapp/playground-react-sdk';
import { useMockLazyQuery } from '@/hooks/useMockLazyQuery';
import { useMockMutation } from '@/hooks/useMockMutation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { isMockMode } from '@/utils/mockMode';
import AuthLayout from '../components/AuthLayout';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { devEmailService } from '@/utils/devEmailService';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Auth hooks for login
  const realAuth = isMockMode() ? null : useAuth();
  const mockAuth = isMockMode() ? useMockAuth() : null;
  const { login } = (isMockMode() ? mockAuth : realAuth)!;

  const realQuery = isMockMode() ? null : useLazyQuery('EmailVerification');
  const mockQuery = isMockMode() ? useMockLazyQuery('EmailVerification') : null;
  const { query } = (isMockMode() ? mockQuery : realQuery)!;
  
  const realMutation = isMockMode() ? null : useMutation('EmailVerification');
  const mockMutation = isMockMode() ? useMockMutation('EmailVerification') : null;
  const { create, isPending: isCreating } = (isMockMode() ? mockMutation : realMutation)!;
  
  const email = location.state?.email || '';
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to signup if no email is provided (back button safety)
  useEffect(() => {
    if (!email) {
      navigate('/auth/signup', { replace: true });
    }
  }, [email, navigate]);

  // If no email, show nothing while redirecting
  if (!email) {
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!code) {
      newErrors.code = 'Verification code is required';
    } else if (code.length !== 6 || !/^\d+$/.test(code)) {
      newErrors.code = 'Please enter a valid 6-digit code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TEST MODE ENABLED: Accept any 6-digit code
      // This allows testing the flow without real email delivery
      // We simulate a network request delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the user in to complete account creation
      await login();
      
      toast({
        title: 'Email verified',
        description: 'Your email has been successfully verified.',
      });
      navigate('/ladder');
      
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await create({
        email,
        code: verificationCode
      });

      // Send verification email (development only - logs to console)
      devEmailService.sendVerificationEmail(email, verificationCode);
      
      toast({
        title: 'Verification email sent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={email ? `We sent a code to ${email}` : 'Enter the verification code'}
      illustration="https://c.animaapp.com/mlix9h3omwDIgk/img/ai_3.png"
      illustrationAlt="email verification abstract illustration"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-tertiary border border-border rounded-md text-center">
          <p className="text-body text-foreground mb-2">
            Please check your email for the verification link.
          </p>
          <p className="text-caption text-tertiary-foreground">
            (Test Mode: Enter any 6-digit code below)
          </p>
        </div>

        <FloatingLabelInput
          id="code"
          label="Verification code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          error={errors.code}
          disabled={isLoading}
          maxLength={6}
        />
        
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-primary text-primary-foreground font-normal shadow-button-primary hover:bg-primary-hover transition-all duration-normal ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>
        
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={isCreating}
            className="w-full text-center text-body-sm text-primary hover:underline transition-colors duration-normal disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Sending...' : 'Resend verification code'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/auth/signup', { replace: true })}
            className="w-full text-center text-body-sm text-tertiary-foreground hover:text-foreground transition-colors duration-normal"
          >
            Back to Sign Up
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
