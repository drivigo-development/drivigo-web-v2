import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Eye, EyeOff } from "lucide-react";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [signupMethod, setSignupMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Use the auth context
  const { signUpWithEmail, signInWithGoogle, loading, checkEmailExists } = useAuth();
console.log(role);
  // Handle Google sign-in
  const handleGoogleSignup = async () => {
    // Validate that a role is selected
    if (!role) {
      toast.error("Please select whether you're a learner or instructor");
      return;
    }
    
    try {
      toast.loading("Redirecting to Google...");
      
      const { error } = await signInWithGoogle({
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      });
      
      if (error) throw error;
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || "Google signup failed");
    }
  };

  // Handle email signup
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    // Validate that a role is selected
    if (!role) {
      toast.error("Please select whether you're a learner or instructor");
      return;
    }

    // Validate passwords
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      // First check if email already exists
      toast.loading("Checking account...");
      const { exists, error: checkError } = await checkEmailExists(email);
      
      if (checkError) {
        toast.dismiss();
        toast.error("Error checking account. Please try again.");
        return;
      }
      
      if (exists) {
        toast.dismiss();
        toast.error("This email is already registered. Please sign in instead.");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
        return;
      }
      
      toast.loading("Creating your account...");
      
      // Sign up with email and password
      const { data, error } = await signUpWithEmail(email, password, { role });

      if (error) throw error;

      toast.dismiss();
      toast.success("Please check your email to verify your account");
      
      // Redirect to sign in page
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (error) {
      toast.dismiss();
      
      if (error.message?.includes("already registered") || 
          error.message?.includes("already in use")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    }
  };

  return (
    <div className="min-h-[92dvh] bg-gradient-to-br from-primary-50 dark:from-primary-900 to-secondary-50 dark:to-secondary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="lg:flex justify-between items-center w-full lg:mx-24">
        {/* Left side - Illustration */}
        <div className="text-center">
          <h2 className="lg:text-5xl text-3xl font-display font-bold text-primary-600 mb-4">
            Create your account
          </h2>
          <p className="mt-2 lg:text-xl text-lg text-secondary-600 mb-4 lg:mb-0">
            Join Drivigo and start your driving journey
          </p>
          <DotLottieReact
            src="https://lottie.host/92c6e218-c7ec-405b-964e-9274e6c5d2e7/owiUUVx8Qc.lottie"
            loop
            autoplay
            className="h-96 hidden lg:block"
          />
        </div>
        
        {/* Right side - Signup form */}
        <div className="lg:max-w-[29rem]  w-full space-y-8">
          <div className="bg-white rounded-lg shadow-soft border border-secondary-200 p-6">
            {/* Signup method toggle */}
            <div className="mb-6">
              <div className="flex border border-secondary-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSignupMethod("email")}
                  className={`flex-1 py-3 text-center font-medium ${
                    signupMethod === "email"
                      ? "bg-primary-500 text-white"
                      : "bg-white text-secondary-700 hover:bg-secondary-50"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setSignupMethod("google")}
                  className={`flex-1 py-3 text-center font-medium ${
                    signupMethod === "google"
                      ? "bg-primary-500 text-white"
                      : "bg-white text-secondary-700 hover:bg-secondary-50"
                  }`}
                >
                  Google
                </button>
              </div>
            </div>

            {/* Role selection */}
            <div className="mb-6">
              <label className="block text-lg font-bold text-secondary-700 mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    value="learner"
                    name="role"
                    checked={role === "learner"}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      role === "learner"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-secondary-200 bg-white text-secondary-700 hover:border-secondary-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👨‍🎓</div>
                      <div className="font-medium">Learner</div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    value="instructor"
                    name="role"
                    checked={role === "instructor"}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      role === "instructor"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-secondary-200 bg-white text-secondary-700 hover:border-secondary-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👨‍🏫</div>
                      <div className="font-medium">Instructor</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conditional rendering based on signup method */}
            {signupMethod === "email" ? (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-secondary-700 mb-2"
                  >
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
                
                <div className="flex gap-4 w-full">
                  <div className="w-full">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-secondary-700 mb-2"
                    >
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
                        placeholder="Create a strong password"
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

                  <div className="w-full">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-secondary-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="input-field pr-10"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500 hover:text-secondary-700 focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>
            ) : (
              <div className="pt-2">
                <button
                  onClick={handleGoogleSignup}
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
                      <span>Sign up with Google</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-secondary-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
