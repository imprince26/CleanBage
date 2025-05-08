import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  HomeIcon,
  ArrowLeft,
  RefreshCcw,
  Mail,
  ShieldAlert,
} from 'lucide-react';

const ErrorPage = ({ error, resetError }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine where to redirect based on user role
  const getHomeLink = () => {
    if (!user) return '/';
    if (user.role === 'garbage_collector') return '/collector/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/resident/dashboard';
  };

  // Get error details based on error props
  const getErrorDetails = () => {
    if (error?.status === 404 || error?.message?.includes('not found')) {
      return {
        title: '404 - Page Not Found',
        description: 'The page you are looking for doesn\'t exist or has been moved.',
        icon: AlertTriangle,
        variant: 'warning'
      };
    } else if (error?.status === 403 || error?.message?.includes('permission')) {
      return {
        title: '403 - Access Denied',
        description: 'You don\'t have permission to access this resource.',
        icon: ShieldAlert,
        variant: 'destructive'
      };
    } else {
      return {
        title: 'Unexpected Error',
        description: 'Something went wrong. Please try again later.',
        icon: AlertTriangle,
        variant: 'destructive'
      };
    }
  };

  const errorDetails = getErrorDetails();
  const Icon = errorDetails.icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className={`mx-auto w-fit p-4 rounded-full transition-colors ${
            errorDetails.variant === 'warning' 
              ? 'bg-yellow-50 dark:bg-yellow-900/20' 
              : 'bg-destructive/10 dark:bg-destructive/20'
          }`}>
            <Icon className={`h-10 w-10 sm:h-12 sm:w-12 transition-colors ${
              errorDetails.variant === 'warning'
                ? 'text-yellow-600 dark:text-yellow-500'
                : 'text-destructive'
            }`} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
              {errorDetails.title}
            </CardTitle>
            <CardDescription className="text-base">
              {errorDetails.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Development Error Details */}
          {error && import.meta.env.VITE_NODE_ENV === 'development' && (
            <>
              <Alert variant={errorDetails.variant} className="text-left">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-semibold">Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="font-mono text-sm break-all">
                    {error.message || 'No error message available'}
                  </div>
                  {error.stack && (
                    <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto text-xs">
                      {error.stack}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
              <Separator />
            </>
          )}

          {/* Troubleshooting Steps */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">
              Try these steps:
            </h3>
            <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
              <li className="transition-colors hover:text-foreground">
                Check your internet connection
              </li>
              <li className="transition-colors hover:text-foreground">
                Refresh the page
              </li>
              <li className="transition-colors hover:text-foreground">
                Go back to the previous page
              </li>
              <li className="transition-colors hover:text-foreground">
                Return to the homepage
              </li>
              <li className="transition-colors hover:text-foreground">
                Contact support if the issue persists
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:flex-row">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (resetError) resetError();
                navigate(-1);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button
              variant="default"
              className="w-full"
              asChild
            >
              <Link to={getHomeLink()}>
                <HomeIcon className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full col-span-2 sm:col-span-1"
              onClick={() => {
                if (resetError) resetError();
                window.location.reload();
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            <Button
              variant="secondary"
              className="w-full col-span-2 sm:col-span-1"
              asChild
            >
              <a
                href="mailto:support@cleanbage.com"
                className="flex items-center justify-center"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorPage;