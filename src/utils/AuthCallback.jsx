import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading, updateUserData } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    const completeAuthentication = async () => {
      try {
        // Get role from URL params if available (for signup flow)
        const role = params.get("role");
        
        // If role is present, this is a signup flow
        if (role) {
          // Update user metadata with the selected role
          const { error } = await updateUserData({
            role,
            signupDate: new Date().toISOString(),
          });
          
          if (error) {
            toast.error("Failed to complete authentication");
            console.error("Error updating user data:", error);
            return;
          }
          toast.success(`Welcome! You've successfully signed up as a ${role}`);
        } else {
          // This is a sign-in flow, no need to update role
          toast.success("You've successfully signed in!");
        }
      } catch (err) {
        console.error("Authentication callback error:", err);
        toast.error("Authentication process failed");
      } finally {
        setIsProcessing(false);
        navigate("/");
      }
    };

    completeAuthentication();
  }, [loading, user, params, navigate, updateUserData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-medium text-gray-700">
        Completing authentication...
      </h2>
    </div>
  );
}
