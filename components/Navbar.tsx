"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    isAdmin,
    setIsAdmin,
    isSuperAdmin,
    setIsSuperAdmin,
    isLoading,
    fullName,
    setFullName,
    tenantName,
    setTenantName,
    hasPermission,
    setPermissions,
  } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/login/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      // Reset admin state globally
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setFullName(null);
      setTenantName(null);
      setPermissions([]);
      // Close the menu
      setIsMenuOpen(false);

      // Redirect to Početna
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Handle error (e.g., display a notification)
    }
  };

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
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          <Link
            href={isAdmin ? "/admin/manage-orders" : "/"}
            className={styles.logo}
          >
            <Image
              src="/assets/logo.png"
              alt="Sany Swings Logo"
              width={40}
              height={40}
              className={styles.logoImage}
            />
            <span>Shop Wizard</span>
          </Link>

          {fullName && (
            <div
              className={styles.welcomeMessage}
              style={isSuperAdmin ? { border: '2px solid #dc2626', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fee2e2' } : {}}
            >
              {fullName} - {tenantName || "Shop Wizard"}
            </div>
          )}

          {isAdmin && (
            <div
              className={`${styles.navLinks} ${isMenuOpen ? styles.active : ""}`}
            >
              {/* Admin navigation links */}
              <>
                {isSuperAdmin && (
                  <Link
                    href="/admin/manage-companies"
                    onClick={() => setIsMenuOpen(false)}
                    className={
                      pathname === "/admin/manage-companies"
                        ? styles.active
                        : ""
                    }
                  >
                    Kompanije
                  </Link>
                )}
                {!isSuperAdmin && (
                  <>
                    {hasPermission("manage_products") && (
                      <Link
                        href="/admin/manage-products"
                        onClick={() => setIsMenuOpen(false)}
                        className={
                          pathname === "/admin/manage-products"
                            ? styles.active
                            : ""
                        }
                      >
                        Proizvodi
                      </Link>
                    )}
                    {(hasPermission("manage_discounts") || hasPermission("manage_vouchers")) && (
                      <Link
                        href="/admin/manage-global-discounts"
                        onClick={() => setIsMenuOpen(false)}
                        className={
                          pathname === "/admin/manage-global-discounts"
                            ? styles.active
                            : ""
                        }
                      >
                        Popusti
                      </Link>
                    )}
                    {hasPermission("manage_orders") && (
                      <Link
                        href="/admin/manage-orders"
                        onClick={() => setIsMenuOpen(false)}
                        className={
                          pathname === "/admin/manage-orders" ? styles.active : ""
                        }
                      >
                        Porudžbine
                      </Link>
                    )}
                    <Link
                      href="/admin/buyers"
                      onClick={() => setIsMenuOpen(false)}
                      className={
                        pathname === "/admin/buyers" ? styles.active : ""
                      }
                    >
                      Kupci
                    </Link>
                  </>
                )}
                <Link
                  href="/"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default navigation
                    handleLogout(); // Call the logout logic
                  }}
                  className={styles.navLink}
                >
                  Izloguj se
                </Link>
              </>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
