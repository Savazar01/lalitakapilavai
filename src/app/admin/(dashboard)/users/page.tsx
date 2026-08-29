"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  UserPlus,
  Shield,
  ShieldAlert,
  KeyRound,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  status: "ACTIVE" | "SUSPENDED";
  emailVerified: boolean;
  createdAt: string;
  _count?: {
    sessions: number;
  };
}

export default function UserManagementPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createName, setCreateName] = React.useState("");
  const [createEmail, setCreateEmail] = React.useState("");
  const [createPassword, setCreatePassword] = React.useState("");
  const [createRole, setCreateRole] = React.useState<"SUPER_ADMIN" | "ADMIN" | "EDITOR">("ADMIN");
  const [createLoading, setCreateLoading] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editRole, setEditRole] = React.useState<"SUPER_ADMIN" | "ADMIN" | "EDITOR">("ADMIN");
  const [editLoading, setEditLoading] = React.useState(false);

  // Password Reset Modal State
  const [passwordModalOpen, setPasswordModalOpen] = React.useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = React.useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null);

  // Delete Safeguard State
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = React.useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const isSuperAdmin = (session?.user as { role?: string } | undefined)?.role === "SUPER_ADMIN";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let ignore = false;
    if (isSuperAdmin) {
      fetch("/api/admin/users")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (!ignore) {
            setUsers(data);
            setLoading(false);
          }
        })
        .catch((e) => {
          console.error("Failed to load users:", e);
          if (!ignore) setLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [isSuperAdmin]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          email: createEmail,
          password: createPassword,
          role: createRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }

      setCreateModalOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("ADMIN");
      fetchUsers();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Error creating user");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          role: editRole,
        }),
      });

      if (res.ok) {
        setEditModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser) return;
    setPasswordLoading(true);
    setPasswordSuccess(null);

    try {
      const res = await fetch(`/api/admin/users/${passwordTargetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        setPasswordSuccess(`Password for ${passwordTargetUser.email} reset successfully.`);
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPasswordSuccess(null);
          setNewPassword("");
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${deleteTargetUser.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModalOpen(false);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          User administration is guarded by Superadmin privileges. Contact your platform administrator to modify access permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Desk */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
              User &amp; Administrator Suite
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage administrative personnel, role authorizations (RBAC), and session security.
          </p>
        </div>

        <Button
          onClick={() => {
            setCreateError(null);
            setCreateModalOpen(true);
          }}
          variant="gold"
          className="gap-2 shrink-0 shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Administrator
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/70 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Total Administrators
            </CardDescription>
            <CardTitle className="text-2xl font-serif font-bold text-foreground">
              {users.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border border-border/70 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Superadmins
            </CardDescription>
            <CardTitle className="text-2xl font-serif font-bold text-primary">
              {users.filter((u) => u.role === "SUPER_ADMIN").length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border border-border/70 bg-card/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Active Accounts
            </CardDescription>
            <CardTitle className="text-2xl font-serif font-bold text-green-500">
              {users.filter((u) => u.status === "ACTIVE").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground shrink-0">Role Filter:</span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="SUPER_ADMIN">Superadmin</SelectItem>
              <SelectItem value="ADMIN">Administrator</SelectItem>
              <SelectItem value="EDITOR">Editor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-serif font-bold">User Identity</TableHead>
              <TableHead className="text-xs font-serif font-bold">Role (RBAC)</TableHead>
              <TableHead className="text-xs font-serif font-bold">Status</TableHead>
              <TableHead className="text-xs font-serif font-bold">Active Sessions</TableHead>
              <TableHead className="text-xs font-serif font-bold">Created Date</TableHead>
              <TableHead className="text-xs font-serif font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                  No administrators found matching your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const isCurrentUser = session?.user?.id === u.id;
                return (
                  <TableRow key={u.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-serif text-xs font-bold text-primary">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            {u.name}
                            {isCurrentUser && (
                              <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          u.role === "SUPER_ADMIN"
                            ? "gold"
                            : u.role === "ADMIN"
                            ? "default"
                            : "outline"
                        }
                        className="text-[10px] uppercase font-mono tracking-wider"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() => !isCurrentUser && handleToggleStatus(u)}
                        disabled={isCurrentUser}
                        title={
                          isCurrentUser
                            ? "Cannot suspend your own account"
                            : `Click to ${u.status === "ACTIVE" ? "Suspend" : "Activate"}`
                        }
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                          u.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 hover:bg-green-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                        } ${isCurrentUser ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                      >
                        {u.status === "ACTIVE" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Suspended
                          </>
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {u._count?.sessions || 0} session(s)
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(u);
                            setEditName(u.name);
                            setEditRole(u.role);
                            setEditModalOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit User Role / Name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPasswordTargetUser(u);
                            setNewPassword("");
                            setPasswordSuccess(null);
                            setPasswordModalOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-primary hover:bg-primary/10"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isCurrentUser}
                          onClick={() => {
                            setDeleteTargetUser(u);
                            setDeleteModalOpen(true);
                          }}
                          className={`h-7 w-7 p-0 ${
                            isCurrentUser
                              ? "opacity-30 cursor-not-allowed"
                              : "text-destructive hover:bg-destructive/10"
                          }`}
                          title={isCurrentUser ? "Cannot delete yourself" : "Delete User"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog: Create Administrator */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Add Administrator</DialogTitle>
              <DialogDescription className="text-xs">
                Invite a new administrative member to manage catalog, media, and exhibitions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              {createError && (
                <div className="p-2.5 rounded bg-destructive/10 border border-destructive/30 text-destructive text-[11px]">
                  {createError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Full Name</label>
                <Input
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Address</label>
                <Input
                  required
                  type="email"
                  placeholder="ananya@lalitakapilavai.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Initial Password</label>
                <Input
                  required
                  type="password"
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Role Authorization (RBAC)</label>
                <Select
                  value={createRole}
                  onValueChange={(val) => setCreateRole(val as "SUPER_ADMIN" | "ADMIN" | "EDITOR")}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Superadmin (Full Access &amp; User Mgmt)</SelectItem>
                    <SelectItem value="ADMIN">Administrator (Catalog, Events &amp; Media)</SelectItem>
                    <SelectItem value="EDITOR">Editor (Content &amp; Blog Posts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={createLoading}>
                {createLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Role & Name */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleUpdateUser}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Edit Administrator</DialogTitle>
              <DialogDescription className="text-xs">
                Update account display identity or adjust role authorization level.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Full Name</label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email (Permanent Identity)</label>
                <Input
                  disabled
                  value={editingUser?.email || ""}
                  className="text-xs bg-muted/50 text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Role</label>
                <Select
                  value={editRole}
                  onValueChange={(val) => setEditRole(val as "SUPER_ADMIN" | "ADMIN" | "EDITOR")}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Superadmin</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={editLoading}>
                {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Reset Password */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Reset User Password</DialogTitle>
              <DialogDescription className="text-xs">
                Set a new password for <span className="font-semibold text-foreground">{passwordTargetUser?.email}</span>. Existing sessions will be revoked.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-xs">
              {passwordSuccess && (
                <div className="p-2.5 rounded bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-[11px]">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-foreground">New Temporary Password</label>
                <Input
                  required
                  type="password"
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPasswordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={passwordLoading}>
                {passwordLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Safeguard */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you certain you wish to delete the administrator account for{" "}
              <strong className="text-foreground">{deleteTargetUser?.name}</strong> ({deleteTargetUser?.email})?
              This action terminates all credentials and session tokens permanently.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
