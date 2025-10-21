"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useSidebar } from "./SidebarContext";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const {
    isAdmin,
    isSuperAdmin,
    isLoading,
    fullName,
    tenantName,
  } = useAuth();

  if (isLoading) {
    return null;
  }

  // Hide navbar on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <div className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          {isAdmin && (
            <button
              className={styles.menuButton}
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          )}
          {fullName && (
            <div
              className={styles.welcomeMessage}
              style={isSuperAdmin ? { border: '2px solid #dc2626', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fee2e2' } : {}}
            >
              {fullName} - {tenantName || "Shop PRO"}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
