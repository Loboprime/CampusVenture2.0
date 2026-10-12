import { useState, useEffect } from "react";
import {
  GraduationCap,
  LineChart,
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth, ROLE_PROFILES } from "@/lib/auth-context";
import type { Role } from "@/lib/demo-data";

export function AuthDialog() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalDefaultRole,
    loginAsRole,
    signIn,
    signUp,
    dbStatus,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"quick" | "signin" | "signup">("quick");

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign up form state
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpOrg, setSignUpOrg] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Set default role or tab when modal opens
  useEffect(() => {
    if (authModalDefaultRole) {
      setSelectedRole(authModalDefaultRole);
    }
  }, [authModalDefaultRole]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setSignInLoading(true);

    const res = await signIn(signInEmail, signInPassword);
    setSignInLoading(false);

    if (!res.success) {
      setSignInError(res.error || "Failed to sign in. Please check your credentials.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setSignUpLoading(true);

    const res = await signUp({
      email: signUpEmail,
      password: signUpPassword,
      role: selectedRole,
      name: signUpName,
      org: signUpOrg,
    });
    setSignUpLoading(false);

    if (!res.success) {
      setSignUpError(res.error || "Failed to register. Please check your details.");
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="max-w-md p-6 sm:max-w-lg">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-brand text-xs font-bold text-primary-foreground">
                CV
              </span>
              <span className="font-semibold tracking-tight text-foreground">CampusVenture</span>
            </div>

            {dbStatus?.connected ? (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-normal"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Database className="size-3" />
                Database connected
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Database className="size-3" />
                Connecting...
              </Badge>
            )}
          </div>

          <DialogTitle className="text-xl font-bold">Authentication & Role Access</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sign in to access your role-authorized workspace, or use instant 1-click role access.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "quick" | "signin" | "signup")}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick" className="text-xs">
              <Sparkles className="size-3.5 mr-1" /> Quick Access
            </TabsTrigger>
            <TabsTrigger value="signin" className="text-xs">
              <Lock className="size-3.5 mr-1" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-xs">
              <User className="size-3.5 mr-1" /> Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Quick 1-Click Role Access */}
          <TabsContent value="quick" className="space-y-3 pt-3">
            <p className="text-xs text-muted-foreground">
              Select any role to immediately authenticate and test its specific features & authorization guards:
            </p>

            <div className="grid gap-2.5">
              {/* Student */}
              <button
                type="button"
                onClick={() => loginAsRole("student")}
                className="group flex w-full items-center justify-between rounded-xl border border-border/80 bg-card/60 p-3.5 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">Student Founder</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        Founder
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_PROFILES.student.name} • {ROLE_PROFILES.student.org}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>

              {/* Investor */}
              <button
                type="button"
                onClick={() => loginAsRole("investor")}
                className="group flex w-full items-center justify-between rounded-xl border border-border/80 bg-card/60 p-3.5 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <LineChart className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">Investor</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        Angel / VC
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_PROFILES.investor.name} • {ROLE_PROFILES.investor.org}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>

              {/* University */}
              <button
                type="button"
                onClick={() => loginAsRole("university")}
                className="group flex w-full items-center justify-between rounded-xl border border-border/80 bg-card/60 p-3.5 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">University / Cell</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        Partner
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_PROFILES.university.name} • {ROLE_PROFILES.university.org}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            </div>
          </TabsContent>

          {/* Email + Password Sign In */}
          <TabsContent value="signin" className="pt-3">
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {signInError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{signInError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="text-xs">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="founder@university.edu"
                    className="pl-9 text-xs"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signin-password" className="text-xs">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full text-xs" disabled={signInLoading}>
                {signInLoading ? (
                  <>
                    <Loader2 className="mr-2 size-3.5 animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In with Supabase <ArrowRight className="ml-1 size-3.5" />
                  </>
                )}
              </Button>

              <div className="rounded-lg bg-muted/50 p-2 text-center text-[11px] text-muted-foreground">
                Tip: For instant testing without registering, use the <strong>Quick Access</strong> tab.
              </div>
            </form>
          </TabsContent>

          {/* Create Account / Sign Up */}
          <TabsContent value="signup" className="pt-3">
            <form onSubmit={handleSignUp} className="space-y-3">
              {signUpError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{signUpError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Select Your Role</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("student")}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
                      selectedRole === "student"
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <GraduationCap className="size-4" />
                    <span>Founder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("investor")}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
                      selectedRole === "investor"
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <LineChart className="size-4" />
                    <span>Investor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("university")}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
                      selectedRole === "university"
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <Building2 className="size-4" />
                    <span>University</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="signup-name" className="text-xs">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    placeholder="e.g. Alex Chen"
                    className="text-xs"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-org" className="text-xs">
                    Organization / College
                  </Label>
                  <Input
                    id="signup-org"
                    placeholder="e.g. Tech Institute"
                    className="text-xs"
                    value={signUpOrg}
                    onChange={(e) => setSignUpOrg(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-email" className="text-xs">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="alex@tech.edu"
                  className="text-xs"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-password" className="text-xs">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 6 characters"
                  className="text-xs"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full text-xs" disabled={signUpLoading}>
                {signUpLoading ? (
                  <>
                    <Loader2 className="mr-2 size-3.5 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Register as {selectedRole === "student" ? "Founder" : selectedRole === "investor" ? "Investor" : "University Partner"}
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
