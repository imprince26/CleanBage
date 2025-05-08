import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  HomeIcon, 
  ArrowLeft, 
  HelpCircle, 
  Search,
  AlertTriangle 
} from 'lucide-react';

const NotFound = () => {
  const { user } = useAuth();

  // Determine where to redirect based on user role
  const getHomeLink = () => {
    if (!user) return '/';
    if(user.role === 'garbage_collector') return '/collector/dashboard';
    if(user.role === 'admin') return '/admin/dashboard';
    return '/resident/dashboard';
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-fit p-4 rounded-full bg-yellow-50 dark:bg-yellow-900/20 mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-500" />
          </div>
          <CardTitle className="text-3xl">Page Not Found</CardTitle>
          <CardDescription className="text-base mt-2">
            Oops! The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-3">
            <p className="font-medium">Here are a few suggestions:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Check if the URL is correct</li>
              <li>Go back to the previous page</li>
              <li>Return to the homepage</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto"
          >
            <Link to={getHomeLink()}>
              <HomeIcon className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="secondary"
            asChild
            className="w-full sm:w-auto"
          >
            <Link to="/help">
              <HelpCircle className="mr-2 h-4 w-4" />
              Get Help
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;