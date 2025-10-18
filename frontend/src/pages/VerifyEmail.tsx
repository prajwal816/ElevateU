import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email`, { params: { token } });
        setStatus("success");
        setMessage(
          res.data?.message ||
            "Email verified successfully. You can now log in."
        );
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Invalid or expired verification link."
        );
      }
    };
    if (token) verify();
    else {
      setStatus("error");
      setMessage("Missing verification token.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>Confirm your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={`mb-6 ${
                status === "error" ? "text-red-400" : "text-muted-foreground"
              }`}
            >
              {message}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/login")}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
