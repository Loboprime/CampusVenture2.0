import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "@/lib/demo-data";
import { supabase, checkDatabaseConnection, type ConnectionStatus } from "@/lib/supabase";
import { toast } from "sonner";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  org: string;
  avatarInitials?: string;
  isDemo?: boolean;
}

export const ROLE_PROFILES: Record<Role, { name: string; email: string; org: string }> = {
  student: {
    name: "Aayush Patil",
    email: "aayush@coep.ac.in",
    org: "COEP Technological University",
  },
  investor: {
    name: "Anaya Krishnan",
    email: "anaya@northbridge.vc",
    org: "Northbridge Seed",
  },
  university: {
    name: "COEP Innovation Cell",
    email: "innovation@coep.ac.in",
    org: "COEP Technological University",
  },
};

const AUTH_STORAGE_KEY = "campusventure.auth.user.v1";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  dbStatus: ConnectionStatus | null;
  isAuthModalOpen: boolean;
  authModalDefaultRole: Role | undefined;
  openAuthModal: (defaultRole?: Role) => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    email: string;
    password: string;
    role: Role;
    name: string;
    org: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: Role) => void;
  switchRole: (role: Role) => void;
  signOut: () => Promise<void>;
  refreshDbStatus: () => Promise<ConnectionStatus>;
  hasRole: (requiredRole: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function extractUserData(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): AuthUser {
  const meta = supabaseUser.user_metadata || {};
  const rawRole = meta["role"];
  const role: Role =
    rawRole === "student" || rawRole === "investor" || rawRole === "university"
      ? rawRole
      : "student";

  const rawName = meta["name"] || meta["full_name"];
  const name =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName
      : supabaseUser.email?.split("@")[0] || "User";

  const rawOrg = meta["org"];
  const org =
    typeof rawOrg === "string" && rawOrg.trim().length > 0
      ? rawOrg
      : ROLE_PROFILES[role]?.org || "CampusVenture";

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name,
    role,
    org,
    avatarInitials: getInitials(name),
    isDemo: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<ConnectionStatus | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<Role | undefined>(undefined);

  const openAuthModal = useCallback((defaultRole?: Role) => {
    setAuthModalDefaultRole(defaultRole);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const refreshDbStatus = useCallback(async () => {
    const status = await checkDatabaseConnection();
    setDbStatus(status);
    return status;
  }, []);

  // Initialize auth & check DB connection on mount
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        // 1. Check live database connectivity
        const status = await checkDatabaseConnection();
        if (mounted) setDbStatus(status);

        // 2. Check Supabase auth session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const authUser = extractUserData(session.user);
          setUser(authUser);
        } else if (mounted) {
          // Check cached local auth
          const cached = window.localStorage.getItem(AUTH_STORAGE_KEY);
          if (cached) {
            try {
              const parsed = JSON.parse(cached) as AuthUser;
              setUser({
                ...parsed,
                avatarInitials: getInitials(parsed.name),
              });
            } catch {
              // Corrupt cache - leave user null
            }
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initialize();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const authUser = extractUserData(session.user);
        setUser(authUser);
        try {
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        } catch {
          /* ignore */
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // One-click quick login for any role
  const loginAsRole = useCallback((role: Role) => {
    const profile = ROLE_PROFILES[role];
    const newUser: AuthUser = {
      id: `usr-${role}-${Date.now().toString(36)}`,
      email: profile.email,
      name: profile.name,
      role,
      org: profile.org,
      avatarInitials: getInitials(profile.name),
      isDemo: true,
    };

    setUser(newUser);
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      /* ignore */
    }

    setIsAuthModalOpen(false);
    toast.success(`Signed in as ${profile.name} (${role})`);
  }, []);

  // Smooth role switching
  const switchRole = useCallback(
    (newRole: Role) => {
      if (user) {
        const updated: AuthUser = {
          ...user,
          role: newRole,
          org: ROLE_PROFILES[newRole].org,
        };
        setUser(updated);
        try {
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        toast.info(`Switched role to ${newRole}`);
      } else {
        loginAsRole(newRole);
      }
    },
    [user, loginAsRole],
  );

  // Email + password sign in with Supabase
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If Supabase credentials fail, provide clear helpful message
          return { success: false, error: error.message };
        }

        if (data.user) {
          const authenticatedUser = extractUserData(data.user);

          setUser(authenticatedUser);
          try {
            window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
          } catch {
            /* ignore */
          }

          setIsAuthModalOpen(false);
          toast.success(`Welcome back, ${authenticatedUser.name}!`);
          return { success: true };
        }

        return { success: false, error: "Authentication failed. No user returned." };
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        return { success: false, error: message };
      }
    },
    [],
  );

  // Email + password sign up with Supabase
  const signUp = useCallback(
    async ({
      email,
      password,
      role,
      name,
      org,
    }: {
      email: string;
      password: string;
      role: Role;
      name: string;
      org: string;
    }): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              name,
              org,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const authenticatedUser = extractUserData({
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: { role, name, org },
          });

          setUser(authenticatedUser);
          try {
            window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
          } catch {
            /* ignore */
          }

          setIsAuthModalOpen(false);
          toast.success(`Account created! Welcome, ${name}.`);
          return { success: true };
        }

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed.";
        return { success: false, error: message };
      }
    },
    [],
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }

    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* ignore */
    }

    toast.success("Signed out successfully");
  }, []);

  // Authorization helper
  const hasRole = useCallback(
    (requiredRole: Role) => {
      return user?.role === requiredRole;
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        dbStatus,
        isAuthModalOpen,
        authModalDefaultRole,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        loginAsRole,
        switchRole,
        signOut,
        refreshDbStatus,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
