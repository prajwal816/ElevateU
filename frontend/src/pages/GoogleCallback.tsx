import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const selectedRole = searchParams.get("selectedRole") as
      | "student"
      | "teacher";

    if (!token || !selectedRole) {
      toast({
        title: "Authentication failed",
        description: "Invalid callback data",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }

    const processGoogleLogin = async () => {
      const response = await handleGoogleCallback(token, selectedRole);
      if (!response) {
        navigate("/login", { replace: true });
      }
    };

    processGoogleLogin();
  }, [searchParams, navigate, handleGoogleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">
          Completing Google Sign-In...
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
