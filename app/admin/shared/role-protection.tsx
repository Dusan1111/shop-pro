"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RoleProtectionProps {
  children: React.ReactNode;
  allowSuperAdmin?: boolean;
  requiredPermission?: string;
}

export default function RoleProtection({ children, allowSuperAdmin = false, requiredPermission }: RoleProtectionProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    try {
      const response = await fetch('/api/auth/me');

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      // If super admin trying to access regular pages
      if (data.isSuperAdmin && !allowSuperAdmin) {
        router.push('/admin/manage-companies');
        return;
      }

      // If regular user trying to access super admin pages
      if (!data.isSuperAdmin && allowSuperAdmin) {
        router.push('/admin/manage-products');
        return;
      }

      // Check for required permission
      if (requiredPermission && !data.isSuperAdmin) {
        const hasPermission = data.permissions?.includes(requiredPermission);
        if (!hasPermission) {
          router.push('/admin/manage-orders');
          return;
        }
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Error checking role:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Učitavanje...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
