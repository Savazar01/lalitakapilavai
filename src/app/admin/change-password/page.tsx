"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { KeyRound, Lock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-scope min-h-screen flex flex-col items-center justify-center p-4 bg-background selection:bg-primary selection:text-primary-foreground relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="border border-border shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="h-1.5 w-full bg-amber-500" />

          <CardHeader className="text-center pb-4 pt-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-semibold">
              Security Action Required
            </span>
            <CardTitle className="text-2xl mt-1 text-foreground font-serif">
              Change Initial Password
            </CardTitle>
            <CardDescription className="text-xs">
              For local security compliance, you must set a new password before accessing the control center.
            </CardDescription>
          </CardHeader>

          {success ? (
            <CardContent className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
              <p className="text-sm font-medium text-foreground">
                Password updated successfully!
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to administrative control center...
              </p>
            </CardContent>
          ) : (
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
                    htmlFor="currentPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    Current / Initial Password
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="newPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-type new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="text-xs"
                  />
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-6 flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="default"
                  className="w-full font-bold cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating Password...
                    </>
                  ) : (
                    "Update Password & Continue"
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
