"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  isLoading: boolean; // New loading state
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
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Function to update state and save to local storage
  const setIsAdmin = (value: boolean) => {
    setIsAdminState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("isAdmin", JSON.stringify(value)); // Save to local storage
    }
  };

  // Mark loading as complete after first render
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, setIsAdmin, isLoading }}>
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