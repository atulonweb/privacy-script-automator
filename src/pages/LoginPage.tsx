import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, resendVerificationEmail } = useAuth();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error("Agreement Required", {
        description: "You must accept the Privacy Policy and Terms of Service to continue"
      });
      return;
    }
    
    setIsLoading(true);
    setShowVerificationAlert(false);

    try {
      await signIn(email, password);
      // Navigation is handled in the auth context
    } catch (error: any) {
      if (error.message === 'email_not_confirmed') {
        setShowVerificationAlert(true);
      } else {
        toast.error("Login Failed", { 
          description: error.message || "Invalid email or password. Please try again."
        });
      }
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(email);
      toast.success("Verification Email Sent", { 
        description: "Please check your inbox for the verification email."
      });
    } catch (error: any) {
      toast.error("Failed to Send Verification", { 
        description: error.message || "Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showVerificationAlert && (
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertDescription>
                  Your email has not been verified. Please check your inbox or{" "}
                  <button 
                    className="text-brand-600 underline font-medium" 
                    onClick={handleResendVerification}
                  >
                    click here to resend the verification email
                  </button>.
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-800">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
                </label>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-brand-600 hover:bg-brand-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : 'Log in'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground text-center w-full">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-800">
                Create an account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
