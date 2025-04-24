import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
// import { Loader } from '@/components/ui/loader';

export default function GoogleAuthHandler() {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      handleGoogleCallback(token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      {/* <Loader className="h-8 w-8" /> */}
      <p className="ml-2">Processing authentication...</p>
    </div>
  );
}