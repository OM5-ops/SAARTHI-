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
import { register } from "@/services/api/auth";
import { setDemoMode } from "@/services/dataSource";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Gauge, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  async function handleCreateWorkspace() {
    if (!company.trim() || !email.trim()) {
      setError("Enter your business name and email to register.");
      return;
    }
    if (password.length < 8) {
      setError("Choose a password of at least 8 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      try {
        await register(email.trim(), password, company.trim());
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
      toast.success("Workspace created", {
        description: `Welcome, ${company.trim()}.`,
      });
      void navigate({ to: "/" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      data-ocid="register.page"
      className="mx-auto flex max-w-md flex-col gap-6 py-8"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Gauge className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold">
          Register your business
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a SARRTHI workspace for your MSME.
        </p>
      </div>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Business registration</CardTitle>
          <CardDescription>
            Your workspace is stored securely on the SARRTHI platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="register-company">Business name</Label>
              <Input
                id="register-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Sarrthi Precision Components"
                data-ocid="register.company_input"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@business.in"
                data-ocid="register.email_input"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  data-ocid="register.password_input"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  data-ocid="register.password_toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            {error ? (
              <p
                data-ocid="register.error_state"
                role="alert"
                className="text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              className="w-full"
              data-ocid="register.submit_button"
              onClick={() => void handleCreateWorkspace()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating workspace…
                </>
              ) : (
                "Create workspace"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link
              to="/login"
              data-ocid="register.login_link"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      <Disclaimer className="justify-center" />
    </div>
  );
}
