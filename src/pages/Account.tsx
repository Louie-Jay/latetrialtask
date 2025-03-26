import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Key,
  Shield,
  Loader,
  AlertCircle,
  Ticket,
} from "lucide-react";
// import { supabase, signIn, signUp } from '../lib/supabase';
import { createClient } from "@supabase/supabase-js";
import supabase from "../../supabase";
import { useSession } from "../context/SessionContext";

export default function Account() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "user",
  });

  const { session, user } = useSession();
  const { updateUserRole } = useSession();
  if (session) return <Navigate to="/dashboard" />;

  // const supabase = createClient('https://tqpjskgcqrbxrcuivkmx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxcGpza2djcXJieHJjdWl2a214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMDU4MTgsImV4cCI6MjA1ODU4MTgxOH0.JSSiu1Zz3hy7-6-VtoF4EelZ80iNmIq4RUjWggwJKLQ')

  // const handleSubmit = async (e: React.FormEvent) => {
  // e.preventDefault();
  // if (!validateForm()) return;

  // setLoading(true);
  // setError(null);

  // try {
  //   if (showLogin) {
  //     // Sign in
  //     const { data, error: signInError } = await signIn(formData.email, formData.password);
  //     if (signInError) throw signInError;

  //     // Redirect based on role
  //     if (data?.user) {
  //       const { data: profile } = await supabase
  //         .from('users')
  //         .select('role')
  //         .eq('id', data.user.id)
  //         .single();

  //       if (profile?.role === 'admin' || profile?.role === 'dj' || profile?.role === 'promoter') {
  //         navigate('/portal/dashboard');
  //       } else {
  //         navigate('/dashboard');
  //       }
  //     }
  //   } else {
  //     // Sign up
  //     const userData = {
  //       full_name: formData.fullName,
  //       role: formData.role
  //     };

  //     await signUp(formData.email, formData.password, userData);

  //     // Show success message and switch to login
  //     setShowLogin(true);
  //     setFormData({
  //       email: formData.email,
  //       password: '',
  //       confirmPassword: '',
  //       fullName: '',
  //       role: 'user'
  //     });
  //     setError('Account created! Please sign in.');
  //     return;
  //   }
  // } catch (err) {
  //   console.error('Auth error:', err);
  //   setError(err instanceof Error ? err.message : 'Authentication failed');
  // } finally {
  //   setLoading(false);
  // }
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          setError(
            error instanceof Error ? error.message : "Authentication failed"
          );
        } else {
          // updateUserRole("admin");
          
          // navigate("/");
          navigate("/dashboard");
        }
      
      setLoading(false);
    

    // try {
    //   if (!showLogin) {
    //     // Sign up
    //     const userData = {
    //       full_name: formData.fullName,
    //       role: formData.role,
    //     };

    //     await supabase.auth.signUp({
    //       email: formData.email,
    //       password: formData.password,
    //     });

    //     // Show success message and switch to login
    //     setShowLogin(true);
    //     setFormData({
    //       email: formData.email,
    //       password: "",
    //       confirmPassword: "",
    //       fullName: "",
    //       role: "user",
    //     });
    //     setError("Account created! Please sign in.");
    //   } else {
    //     // setStatus("Logging in...");
    //     const { error } = await supabase.auth.signInWithPassword({
    //       email: formData.email,
    //       password: formData.password,
    //     });
    //     if (error) {
    //       setError(
    //         error instanceof Error ? error.message : "Authentication failed"
    //       );
    //     } else {
    //       updateUserRole("admin");
    //       navigate("/dashboard");
    //     }
    //   }
    //   setLoading(false);
    // } catch (err) {
    //   console.error("Auth error:", err);
    //   setError(err instanceof Error ? err.message : "Authentication failed");
    // } finally {
    //   setLoading(false);
    // }
    
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (!showLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (!formData.fullName) {
        setError("Full name is required");
        return false;
      }
    }

    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium-black">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse" />
            <Ticket className="relative z-10 mx-auto h-16 w-16 text-purple-400" />
          </div>
          <h2 className="mt-6 text-4xl font-bold text-gradient">
            {showLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-3 text-gray-400">
            {showLogin
              ? "Sign in to access your account"
              : "Join us and unlock exclusive features"}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-8 border border-gray-800/50 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
              <p className="text-sm text-red-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {!showLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Type
                  </label>
                  <div className="relative group">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500 appearance-none"
                      required
                    >
                      <option value="user">Guest</option>
                      <option value="dj">DJ</option>
                      <option value="promoter">Promoter</option>
                      <option value="creator">Creator</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="premium-button w-full py-4"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {showLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : showLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            {showLogin && (
              <div className="mt-6 text-center">
                <Link
                  to="/forgot-password"
                  className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setShowLogin(!showLogin);
              setError(null);
              setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                fullName: "",
                role: "user",
              });
            }}
            className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
          >
            {showLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
