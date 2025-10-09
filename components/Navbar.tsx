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
  const { isAdmin, setIsAdmin, isSuperAdmin, setIsSuperAdmin, isLoading } = useAuth();

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
    return;
  }

  return (
    <div className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <button
            className={styles.menuButton}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

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

          <div
            className={`${styles.navLinks} ${isMenuOpen ? styles.active : ""}`}
          >
            {isAdmin ? (
              // Admin navigation links
              <>
                {isSuperAdmin && (
                  <Link
                    href="/admin/manage-companies"
                    onClick={() => setIsMenuOpen(false)}
                    className={
                      pathname === "/admin/manage-companies" ? styles.active : ""
                    }
                  >
                    Kompanije
                  </Link>
                )}
                {!isSuperAdmin && (
                  <>
                    <Link
                      href="/admin/manage-products"
                      onClick={() => setIsMenuOpen(false)}
                      className={
                        pathname === "/admin/manage-products" ? styles.active : ""
                      }
                    >
                      Proizvodi
                    </Link>
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
                    <Link
                      href="/admin/manage-orders"
                      onClick={() => setIsMenuOpen(false)}
                      className={
                        pathname === "/admin/manage-orders" ? styles.active : ""
                      }
                    >
                      Porudžbine
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
            ) : null}
          </div>
        </div>
      </nav>
    </div>
  );
}
