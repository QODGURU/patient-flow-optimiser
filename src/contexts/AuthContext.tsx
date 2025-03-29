
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/supabase";
import { toast } from "sonner";

interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  bypassAuth: () => Promise<void>; // For development only
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Check for admin bypass (development only)
    const checkAdminBypass = () => {
      const adminBypass = localStorage.getItem("admin_bypass");
      if (adminBypass) {
        try {
          const mockProfile = JSON.parse(adminBypass) as Profile;
          setProfile(mockProfile);
          setUser({ id: mockProfile.id, email: mockProfile.email } as User);
          setIsLoading(false);
          return true;
        } catch (error) {
          console.error("Error parsing admin bypass:", error);
          localStorage.removeItem("admin_bypass");
        }
      }
      return false;
    };
    
    // If admin bypass exists, skip normal auth
    if (checkAdminBypass()) {
      console.log("Using admin bypass");
      return;
    }
    
    // Set up auth state listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Defer Supabase calls with setTimeout to prevent deadlocks
        if (newSession?.user) {
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );
    
    // THEN check for existing session
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          console.log("Found existing session:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        console.log("Fetched profile:", data);
        setProfile(data as Profile);
      } else {
        console.log("No profile found for user:", userId);
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        toast.error(error.message || "Failed to login");
        throw error;
      }
      
      if (data.user) {
        console.log("Login successful:", data.user.email);
        toast.success(`Welcome back, ${email}!`);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      // Check for admin bypass first
      if (localStorage.getItem("admin_bypass")) {
        localStorage.removeItem("admin_bypass");
        setUser(null);
        setProfile(null);
        setSession(null);
        toast.success("Logged out successfully");
        setIsLoading(false);
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // For development only - creates a mock admin session
  const bypassAuth = async () => {
    setIsLoading(true);
    try {
      // Create a mock admin profile - this is for testing only!
      const mockProfile: Profile = {
        id: "bypass-admin-id",
        name: "Admin Bypass",
        email: "admin@example.com",
        role: "admin",
      };
      
      localStorage.setItem("admin_bypass", JSON.stringify(mockProfile));
      setProfile(mockProfile);
      // Set minimal user object to make isAuthenticated true
      setUser({ id: "bypass-admin-id", email: "admin@example.com" } as User);
      
      // Create a mock session to simulate being logged in
      const mockSession = {
        access_token: "fake-token",
        refresh_token: "fake-refresh-token",
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: "bearer",
        user: { id: "bypass-admin-id", email: "admin@example.com" } as User
      } as Session;
      
      setSession(mockSession);
      
      toast.success("Bypassed authentication as Admin!");
    } catch (error) {
      console.error("Bypass auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    isAuthenticated: !!user || !!localStorage.getItem("admin_bypass"),
    isLoading,
    login,
    logout,
    refreshProfile,
    bypassAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
