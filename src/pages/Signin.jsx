
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  // Use the auth context
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  
  // Handle email sign in
  const handleEmailSignin = async (event) => {
    event.preventDefault();

    try {
      toast.loading('Signing in...');
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) throw error;
      
      toast.dismiss();
      toast.success('Login successful!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Failed to log in');
    }
  };

  // Handle Google sign in - direct without role selection
  const handleGoogleSignin = async () => {
    try {
      toast.loading('Redirecting to Google...');
      
      const { error } = await signInWithGoogle({
        redirectTo: `${window.location.origin}/auth/callback`
      });
      
      if (error) throw error;
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Google sign in failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-secondary-900">
            Welcome back
          </h2>
          <p className="mt-2 text-secondary-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-secondary-200">
          <form onSubmit={handleEmailSignin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500 hover:text-secondary-700 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in with Email'
                )}
              </button>
            </div>
          </form>
          
          {/* Google signin option */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="text-center mb-4">
              <span className="text-sm text-secondary-500">Or sign in with</span>
            </div>
            
            <button 
              onClick={handleGoogleSignin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-secondary-300 rounded-lg bg-white hover:bg-secondary-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <FcGoogle className="text-xl" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-secondary-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;