import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Chrome } from 'lucide-react';

export const Login = () => {
  const { loginWithGoogle, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin && !loading) {
      navigate('/admin');
    }
  }, [isAdmin, loading, navigate]);

  const handleLogin = async () => {
    const user = await loginWithGoogle();
    if (user) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in with your authorized Google account to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
            disabled={loading}
          >
            <Chrome className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
