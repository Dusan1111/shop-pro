"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./manage-buyers.module.scss";
import TableComponent from "../shared/smart-table";
import RoleProtection from "../shared/role-protection";

export default function KupciPage() {
  const router = useRouter();

  interface User {
    _id: string;
    name?: string;
    lastname?: string;
    email: string;
    address?: string;
    postalCode?: string;
    city?: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/admin/api/buyers");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error("Server Error:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleProtection allowSuperAdmin={false}>
      <div className="page-title">
        <h1>Kupci</h1>
      </div>
      <div className={styles.kupciPage}>
        {error && <div className={styles.error}>{error.message}</div>}

        {loading ? (
          <p>Učitavanje...</p>
        ) : (
          <>
            <TableComponent
              data={users.map(user => ({
                ...user,
                displayName: user.name || user.name?.split(' ')[0] || '-',
                displayLastName: user.lastname || user.lastname?.split(' ').slice(1).join(' ') || '-',
                maskedPassword: user.password ? '••••••••' : '-'
              }))}
              columns={["ID", "Ime", "Prezime", "Email", "Adresa", "Poštanski kod", "Grad"]}
              columnKeys={["_id", "displayName", "displayLastName", "email", "address", "postalCode", "city"]}
              onRowClick={(user) => router.push(`/admin/buyers/${user._id}`)}
            />
          </>
        )}
      </div>
    </RoleProtection>
  );
}
