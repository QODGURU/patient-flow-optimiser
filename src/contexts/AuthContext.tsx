
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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock function to simulate profile refresh
  const refreshProfile = async () => {
    console.log("Mock profile refresh - not actually calling Supabase");
    // We don't need to do anything here since we're bypassing authentication
  };

  // Mock login function that accepts any credentials
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("Mock login with:", email);
    
    try {
      // Create a mock user and profile
      const mockUser = {
        id: "mock-user-id",
        email: email,
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      
      const mockProfile = {
        id: "mock-user-id",
        name: email.split('@')[0],
        email: email,
        role: "admin", // Always grant admin role
      } as Profile;
      
      // Set the mock user and profile
      setUser(mockUser);
      setProfile(mockProfile);
      
      toast.success(`Welcome back, ${email}!`);
      console.log("Mock login successful:", email);
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
      // Simply clear the user and profile states
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

  const value = {
    user,
    profile,
    session,
    isAuthenticated: !!user, // This will be true after login
    isLoading,
    login,
    logout,
    refreshProfile,
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
