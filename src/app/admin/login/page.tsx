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

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid administrative credentials");
        setIsLoading(false);
      } else {
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
    <Card className="border-2 border-primary/40 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Gold header accent line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

      <CardHeader className="text-center pb-4 pt-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-3">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold">
          Restricted Access
        </span>
        <CardTitle className="text-2xl mt-1 text-foreground font-serif">
          Lalita Kapilavai Admin
        </CardTitle>
        <CardDescription className="text-xs">
          Sign in with your authorized administrative credentials.
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
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@lalitakapilavai.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            variant="gold"
            className="w-full text-stone-950 font-bold"
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background selection:bg-primary selection:text-primary-foreground relative">
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
