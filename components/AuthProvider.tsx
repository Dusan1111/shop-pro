"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  isSuperAdmin: boolean;
  setIsSuperAdmin: (value: boolean) => void;
  isLoading: boolean;
  fullName: string | null;
  setFullName: (value: string | null) => void;
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

  const [fullName, setFullNameState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storedFullName = localStorage.getItem("fullName");
      return storedFullName;
    }
    return null;
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

  const setFullName = (value: string | null) => {
    setFullNameState(value);
    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem("fullName", value);
      } else {
        localStorage.removeItem("fullName");
      }
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
          setFullName(data.fullName || null);
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
    <AuthContext.Provider value={{ isAdmin, setIsAdmin, isSuperAdmin, setIsSuperAdmin, isLoading, fullName, setFullName }}>
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