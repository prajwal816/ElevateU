import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "@/lib/api";

const VerifyNotice = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const resend = async () => {
    if (!email) return;
    setSending(true);
    try {
      await api.post("/auth/verify-email/resend", { email });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              We sent a verification link to your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please check your inbox and click the verification link to
              activate your account.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email to resend link"
                className="w-full px-3 py-2 rounded-md border bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                disabled={sending || !email}
                onClick={resend}
                className="w-full"
              >
                {sending
                  ? "Sending..."
                  : sent
                  ? "Sent! Check your inbox"
                  : "Resend verification email"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyNotice;
