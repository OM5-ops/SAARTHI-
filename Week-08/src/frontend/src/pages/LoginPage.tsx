import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { isDemoMode, setDemoMode } from "@/services/dataSource";
import { login as apiLogin } from "@/services/api/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { Gauge, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  async function handleSignIn() {
    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      try {
        await apiLogin(email.trim(), password);
        setDemoMode(false);
      } catch (err) {
        if (
          err instanceof TypeError ||
          (err instanceof Error && err.message.toLowerCase().includes("fetch"))
        ) {
          setDemoMode(true);
        } else {
          throw err;
        }
      }
      authLogin();
      toast.success("Signed in", {
        description: "Welcome back to SARRTHI.",
      });
      void navigate({ to: "/" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setLoading(true);
    try {
      try {
        await apiLogin("demo@sarrthi.in");
        setDemoMode(false);
      } catch {
        setDemoMode(true);
      }
      authLogin();
      toast.success("Demo login", {
        description: "You are signed in with sample data.",
      });
      void navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  }

  const alreadyDemo = isDemoMode();

  return (
    <div
      data-ocid="login.page"
      className="mx-auto flex max-w-md flex-col gap-6 py-8"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Gauge className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold">Sign in to SARRTHI</h1>
        <p className="text-sm text-muted-foreground">
          Access your MSME procurement and payments workspace.
        </p>
      </div>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Account sign in</CardTitle>
          <CardDescription>
            Sign in with your email and password, or try the demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@business.in"
                data-ocid="login.email_input"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                data-ocid="login.password_input"
                disabled={loading}
              />
            </div>
            {error ? (
              <p
                data-ocid="login.error_state"
                role="alert"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              className="w-full"
              data-ocid="login.submit_button"
              onClick={() => void handleSignIn()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mt-2 w-full"
              data-ocid="login.demo_button"
              onClick={() => void handleDemoLogin()}
              disabled={loading}
            >
              Demo login
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link
              to="/register"
              data-ocid="login.register_link"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>

      <Disclaimer className="justify-center" />
    </div>
  );
}

