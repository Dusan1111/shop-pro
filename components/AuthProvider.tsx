"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  isSuperAdmin: boolean;
  setIsSuperAdmin: (value: boolean) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage immediately
  const [isAdmin, setIsAdminState] = useState(() => {
    if (typeof window !== "undefined") {
      const storedIsAdmin = localStorage.getItem("isAdmin");
      if (storedIsAdmin !== null) {
        return JSON.parse(storedIsAdmin);
      }
    }
    return false;
  });

  const [isSuperAdmin, setIsSuperAdminState] = useState(() => {
    if (typeof window !== "undefined") {
      const storedIsSuperAdmin = localStorage.getItem("isSuperAdmin");
      if (storedIsSuperAdmin !== null) {
        return JSON.parse(storedIsSuperAdmin);
      }
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Function to update state and save to local storage
  const setIsAdmin = (value: boolean) => {
    setIsAdminState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("isAdmin", JSON.stringify(value));
    }
  };

  const setIsSuperAdmin = (value: boolean) => {
    setIsSuperAdminState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("isSuperAdmin", JSON.stringify(value));
    }
  };

  // Check super admin status on mount
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setIsSuperAdmin(data.isSuperAdmin || false);
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSuperAdmin();
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, setIsAdmin, isSuperAdmin, setIsSuperAdmin, isLoading }}>
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