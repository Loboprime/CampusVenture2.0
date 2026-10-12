import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  GraduationCap,
  LineChart,
  Building2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/demo-data";

interface AuthGuardProps {
  requiredRole: Role;
  children: ReactNode;
}

const ROLE_INFO: Record<Role, { title: string; badge: string; icon: typeof GraduationCap; path: string }> = {
  student: {
    title: "Student Founder",
    badge: "Founder",
    icon: GraduationCap,
    path: "/app/student",
  },
  investor: {
    title: "Investor",
    badge: "Angel & VC",
    icon: LineChart,
    path: "/app/investor",
  },
  university: {
    title: "University & Incubator",
    badge: "Institution",
    icon: Building2,
    path: "/app/university",
  },
};

export function AuthGuard({ requiredRole, children }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, openAuthModal, loginAsRole, switchRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">Verifying role authorization...</p>
      </div>
    );
  }

  const targetRole = ROLE_INFO[requiredRole];

  // 1. Not Authenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-lg py-12 px-4">
        <Card className="border-border/80 shadow-elevated">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Lock className="size-6" />
            </div>
            <div className="flex justify-center">
              <Badge variant="outline" className="mb-2 text-xs">
                {targetRole.badge} Area
              </Badge>
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription className="text-xs">
              Please sign in to access the {targetRole.title} portal and protected resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-lg border bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Why do I see this?</p>
              <p>
                CampusVenture uses role-based access control (RBAC) to protect sensitive data rooms,
                founder pitches, and institutional review pipelines.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => loginAsRole(requiredRole)}
                className="w-full flex items-center justify-center gap-2"
              >
                <Sparkles className="size-4" />
                Quick Access as {targetRole.title}
              </Button>
              <Button
                variant="outline"
                onClick={() => openAuthModal(requiredRole)}
                className="w-full"
              >
                Sign In with Email / Other Role
              </Button>
              <Button variant="ghost" asChild className="w-full text-xs text-muted-foreground">
                <Link to="/">Return to Homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Authenticated but Wrong Role (Authorization Mismatch)
  if (user.role !== requiredRole) {
    const currentRole = ROLE_INFO[user.role];

    return (
      <div className="mx-auto max-w-lg py-12 px-4">
        <Card className="border-amber-500/30 bg-card shadow-elevated">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-6" />
            </div>
            <div className="flex justify-center">
              <Badge variant="secondary" className="mb-2 text-xs border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Access Restricted
              </Badge>
            </div>
            <CardTitle className="text-xl">Role Authorization Needed</CardTitle>
            <CardDescription className="text-xs">
              You are currently signed in as a <strong className="text-foreground">{currentRole.title}</strong>,
              but this workspace requires the <strong className="text-foreground">{targetRole.title}</strong> role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Account:</span>
                <span className="font-semibold text-foreground">{user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Role:</span>
                <Badge variant="outline" className="text-[11px]">
                  {currentRole.title}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Required Role:</span>
                <Badge variant="default" className="text-[11px]">
                  {targetRole.title}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => switchRole(requiredRole)}
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="size-4" />
                Switch to {targetRole.title} Workspace
              </Button>
              <Button variant="secondary" asChild className="w-full">
                <Link to={currentRole.path}>
                  Go to My {currentRole.title} Dashboard
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Authenticated and Authorized
  return <>{children}</>;
}
