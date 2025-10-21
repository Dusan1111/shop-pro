"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useSidebar } from "./SidebarContext";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggleSidebar, setIsOpen } = useSidebar();
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
      // Close the sidebar
      setIsOpen(false);

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  if (isLoading) {
    return null;
  }

  // Hide sidebar on login page
  if (pathname === "/login") {
    return null;
  }

  // Only show sidebar for admin users
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile/tablet only */}
      {isOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Logo at the top */}
        <Link
          href={isAdmin ? "/admin/manage-orders" : "/"}
          className={styles.sidebarLogo}
        >
          <Image
            src="/assets/logo.png"
            alt="Shop Pro Logo"
            width={40}
            height={40}
            className={styles.logoImage}
          />
          <span>
            <span style={{ color: '#00008B' }}>shop</span>{' '}
            <span style={{ color: '#ADD8E6' }}>pro</span>
          </span>
        </Link>

        <nav className={styles.sidebarNav}>
          {isSuperAdmin && (
            <Link
              href="/admin/manage-companies"
              onClick={closeSidebarOnMobile}
              className={
                pathname === "/admin/manage-companies" ? styles.active : ""
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
                  onClick={closeSidebarOnMobile}
                  className={
                    pathname === "/admin/manage-products" ? styles.active : ""
                  }
                >
                  Proizvodi
                </Link>
              )}
              {(hasPermission("manage_discounts") || hasPermission("manage_vouchers")) && (
                <Link
                  href="/admin/manage-global-discounts"
                  onClick={closeSidebarOnMobile}
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
                  onClick={closeSidebarOnMobile}
                  className={
                    pathname === "/admin/manage-orders" ? styles.active : ""
                  }
                >
                  Porudžbine
                </Link>
              )}
              {hasPermission("manage_buyers") && (
                <Link
                  href="/admin/buyers"
                  onClick={closeSidebarOnMobile}
                  className={pathname === "/admin/buyers" ? styles.active : ""}
                >
                  Kupci
                </Link>
              )}
            </>
          )}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className={styles.logoutLink}
          >
            Izloguj se
          </Link>
        </nav>
      </aside>
    </>
  );
}
