import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@animaapp/playground-react-sdk';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode } from '@/utils/mockMode';
import AuthLayout from '../components/AuthLayout';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { devEmailService } from '@/utils/devEmailService';

export default function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const realMutation = isMockMode() ? null : useMutation('EmailVerification');
  const mockMutation = isMockMode() ? useMockMutation('EmailVerification') : null;
  const { create, isPending, error } = (isMockMode() ? mockMutation : realMutation)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
        description: 'Please check your email (or browser console in dev mode) for the verification code.',
      });
      
      navigate('/auth/verify-email', { state: { email }, replace: true });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to get started"
      illustration="https://c.animaapp.com/mlix9h3omwDIgk/img/ai_1.png"
      illustrationAlt="abstract signup illustration"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FloatingLabelInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={isPending}
        />
        
        <FloatingLabelInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={isPending}
        />
        
        <FloatingLabelInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          disabled={isPending}
        />
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-body-sm">
            {error.message}
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-primary text-primary-foreground font-normal shadow-button-primary hover:bg-primary-hover transition-all duration-normal ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? 'Creating account...' : 'Sign Up'}
        </Button>
        
        <p className="text-center text-body-sm text-foreground">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="text-primary hover:underline transition-colors duration-normal"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}