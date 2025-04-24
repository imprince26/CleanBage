import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(`/auth/verify-email/${token}`);
        setStatus('success');
      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            {status === 'verifying' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Verifying your email address...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold">Email Verified!</h2>
                <p className="text-center text-muted-foreground">
                  Your email has been successfully verified. You can now log in to your account.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/login">Go to Login</Link>
                </Button>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold">Verification Failed</h2>
                <p className="text-center text-muted-foreground">
                  The verification link is invalid or has expired. Please request a new verification email.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/login">Back to Login</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}