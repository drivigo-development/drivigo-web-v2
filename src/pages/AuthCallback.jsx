// src/pages/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback, loading } = useAuth();
  const [processingCallback, setProcessingCallback] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the role from URL parameters
        const role = searchParams.get('role');
        console.log('Auth callback with role:', role);
        
        // Handle the callback and ensure user data is inserted with the correct role
        const { error } = await handleGoogleCallback({ role });
        
        if (error) {
          console.error('Error in auth callback:', error);
          toast.error(`Authentication error: ${error.message}`);
          // Navigate to login even on error
          navigate('/login', { replace: true });
          return;
        }
        
        console.log('Auth callback successful');
        toast.success('Successfully signed in!');
        
        // Redirect to dashboard on success
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Exception in auth callback:', err);
        toast.error(`Authentication error: ${err.message}`);
        navigate('/login', { replace: true });
      } finally {
        setProcessingCallback(false);
      }
    };

    if (!loading) {
      processCallback();
    }
  }, [handleGoogleCallback, navigate, searchParams, loading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-primary-600">
            {processingCallback ? 'Completing Sign In...' : 'Redirecting...'}
          </h2>
          <div className="mt-4">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-2 text-sm text-secondary-500">
              Please wait while we complete your authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
