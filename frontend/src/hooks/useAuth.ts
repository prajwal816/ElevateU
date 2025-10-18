import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, authStorage, User } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getToken();
      const storedUser = authStorage.getUser();

      if (token && storedUser) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
          authStorage.setUser(userData);
        } catch {
          authStorage.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Normal login
  const login = async (email: string, password: string, selectedRole?: "student" | "teacher") => {
    try {
      const response = await authApi.login({ email, password });
      authStorage.setToken(response.token!);
      authStorage.setUser(response);
      setUser(response);

      // Role mismatch handling
      if (
        (response.role === "Teacher" && selectedRole !== "teacher") ||
        (response.role === "Student" && selectedRole !== "student")
      ) {
        toast({
          title: "Role Mismatch",
          description: `You logged in as ${response.role}, not ${selectedRole}.`,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Login successful!",
        description: `Welcome back, ${response.name}!`,
      });

      if (response.role === "Teacher") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");

      return response;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.message || "Invalid credentials",
        variant: "destructive",
      });
      // navigate("/login"); // ✅ REMOVED THIS LINE
      return null;
    }
  };

  // ... (the rest of your useAuth.ts file is correct and doesn't need changes)

  // Registration
  const register = async (name: string, email: string, password: string, role: "Student" | "Teacher") => {
    try {
      const response = await authApi.register({ name, email, password, role });

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });

      navigate("/verify/notice");
      return response;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
      return null;
    }
  };

  // Google OAuth callback
  const handleGoogleCallback = async (token: string, selectedRole?: "student" | "teacher") => {
    try {
      const response = await authApi.handleGoogleCallback(token);
      authStorage.setToken(response.token!);
      authStorage.setUser(response);
      setUser(response);

      // Role mismatch handling
      if (
        (response.role === "Teacher" && selectedRole !== "teacher") ||
        (response.role === "Student" && selectedRole !== "student")
      ) {
        toast({
          title: "Role Mismatch",
          description: `You logged in as ${response.role}, not ${selectedRole}.`,
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return null;
      }

      toast({
        title: "Google Sign-In successful!",
        description: `Welcome, ${response.name}!`,
      });

      if (response.role === "Teacher") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");

      return response;
    } catch (error: any) {
      toast({
        title: "Google Sign-In failed",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
      return null;
    }
  };

  // Logout
  const logout = () => {
    authStorage.clear();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  // Trigger Google OAuth redirect (for login/register buttons)
  const handleGoogleAuth = (role?: "student" | "teacher") => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google${role ? `?role=${role}` : ""}`;
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    handleGoogleAuth,
    handleGoogleCallback,
    isAuthenticated: !!user,
  };
};