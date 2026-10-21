"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Shield, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Dynamic Admin Login Branding
  const [loginTitle, setLoginTitle] = React.useState("SavazAI WebApps Platform Admin");
  const [loginSubtitle, setLoginSubtitle] = React.useState("Sign in with your authorized administrative credentials.");
  const [loginLogoUrl, setLoginLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.adminLoginTitle) setLoginTitle(data.adminLoginTitle);
          if (data.adminLoginSubtitle) setLoginSubtitle(data.adminLoginSubtitle);
          if (data.adminLoginLogoUrl) {
            setLoginLogoUrl(data.adminLoginLogoUrl);
          } else if (data.logoUrl) {
            setLoginLogoUrl(data.logoUrl);
          }
          if (data.adminLoginTitle) {
            document.title = `${data.adminLoginTitle} | Restricted Access`;
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let resolvedEmail = identifier.trim();

      // Resolve username to email if identifier doesn't contain '@'
      if (!resolvedEmail.includes("@")) {
        const resolveRes = await fetch("/api/auth/resolve-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: resolvedEmail }),
        });

        if (resolveRes.ok) {
          const resolveData = await resolveRes.json();
          if (resolveData?.email) {
            resolvedEmail = resolveData.email;
          }
        } else {
          setError("Invalid username or email address");
          setIsLoading(false);
          return;
        }
      }

      const result = await signIn.email({
        email: resolvedEmail,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid administrative credentials");
        setIsLoading(false);
      } else {
        // In local development, check if user must change password
        if (process.env.NODE_ENV === "development") {
          const meRes = await fetch("/api/admin/me");
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData?.user?.mustChangePassword) {
              router.push("/admin/change-password");
              router.refresh();
              return;
            }
          }
        }

        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border shadow-xl overflow-hidden backdrop-blur-sm">
      {/* High contrast header accent line */}
      <div className="h-1.5 w-full bg-slate-900 dark:bg-slate-100" />

      <CardHeader className="text-center pb-4 pt-6">
        <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center mb-3 overflow-hidden p-1 shadow-2xs">
          {loginLogoUrl ? (
            <img
              src={loginLogoUrl}
              alt={loginTitle}
              className="w-full h-full object-contain rounded-full"
            />
          ) : (
            <Shield className="w-6 h-6 text-foreground" />
          )}
        </div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
          Restricted Access
        </span>
        <CardTitle className="text-2xl mt-1 text-foreground font-serif">
          {loginTitle}
        </CardTitle>
        <CardDescription className="text-xs">
          {loginSubtitle}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 text-xs rounded-md bg-destructive/10 border border-destructive/30 text-destructive font-medium"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="identifier"
              className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              Username or Email
            </label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="SavazAI_Admin"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-primary" />
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6 flex flex-col gap-3">
          <Button
            type="submit"
            variant="default"
            className="w-full font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying Credentials...
              </>
            ) : (
              "Sign In to Control Center"
            )}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            Public registration is disabled. Unauthorized attempts are logged.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="admin-scope min-h-screen flex flex-col items-center justify-center p-4 bg-background selection:bg-primary selection:text-primary-foreground relative">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <React.Suspense
          fallback={
            <Card className="border border-border p-8 text-center animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mx-auto mb-4" />
              <div className="h-4 w-48 bg-muted rounded mx-auto" />
            </Card>
          }
        >
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}
