"use client";

import * as React from "react";
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSession, changePassword, updateUser } from "@/lib/auth-client";

export default function AdminProfilePage() {
  const { data: session, isPending: sessionLoading } = useSession();

  // Profile Tab State
  const defaultName = session?.user?.name || "";
  const defaultEmail = session?.user?.email || "";
  const [customName, setCustomName] = React.useState<string | null>(null);
  const name = customName !== null ? customName : defaultName;
  const email = defaultEmail;

  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState<string | null>(null);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  // Password Tab State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await updateUser({
        name,
      });

      if (res.error) {
        throw new Error(res.error.message || "Failed to update profile details");
      }

      setProfileSuccess("Administrator name updated successfully.");
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Error updating profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        throw new Error(res.error.message || "Failed to update password");
      }

      setPasswordSuccess("Administrative password updated securely. Other sessions revoked.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Error updating password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading admin profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              User Profile & Security
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your administrator profile details and credentials.
          </p>
        </div>

        <Badge variant="gold" className="text-xs uppercase w-fit">
          {(session?.user as { role?: string } | undefined)?.role || "SUPER_ADMIN"}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="details" className="text-xs">
            <User className="w-3.5 h-3.5 mr-1.5" /> Profile Details
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Password & Security
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Details */}
        <TabsContent value="details">
          <Card className="border border-border/80 shadow-sm">
            <form onSubmit={handleUpdateProfile}>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Administrator Identity</CardTitle>
                <CardDescription className="text-xs">
                  Update your display name across administrative audit logs.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {profileSuccess && (
                  <div className="p-3 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-primary" /> Full Name
                  </label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Lalita Kapilavai Superadmin"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-primary" /> Authorized Email Address
                  </label>
                  <Input
                    disabled
                    value={email}
                    className="text-xs bg-muted/60 text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Email address is tied to your primary authentication identity. Contact infrastructure support to reassign.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={profileSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {profileSaving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  Save Profile Details
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security">
          <Card className="border border-border/80 shadow-sm">
            <form onSubmit={handleChangePassword}>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Change Password</CardTitle>
                <CardDescription className="text-xs">
                  Ensure your administrative account uses a strong, unique password.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {passwordSuccess && (
                  <div className="p-3 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-primary" /> Current Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-primary" /> New Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters..."
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-primary" /> Confirm New Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password..."
                    className="text-xs font-mono"
                  />
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={passwordSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {passwordSaving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  Update Administrative Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
