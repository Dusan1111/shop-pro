"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (currentPage + 1).toString(), // API expects 1-based pagination
        limit: pageSize.toString(),
      });

      const response = await fetch(`/admin/api/buyers?${params}`, {
        method: "GET",
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(data.data || []);
        if (data.pagination) {
          setTotalCount(data.pagination.totalCount);
        }
      } else {
        console.error("Error fetching buyers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching buyers:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <>
      <div className="page-title">
        <h1>Kupci</h1>
      </div>
      <RoleProtection allowSuperAdmin={false} requiredPermission="manage_buyers">
        <div className={styles.kupciPage}>
          <TableComponent
            data={users.map((user) => ({
              ...user,
              displayName: user.name || "-",
              displayLastName: user.lastname || "-",
            }))}
            columns={[
              "ID",
              "Ime",
              "Prezime",
              "Email",
              "Adresa",
              "Poštanski kod",
              "Grad",
            ]}
            columnKeys={[
              "_id",
              "displayName",
              "displayLastName",
              "email",
              "address",
              "postalCode",
              "city",
            ]}
            onRowClick={(user) => router.push(`/admin/buyers/${user._id}`)}
            selectedRow={""}
            onRemove={undefined}
            useBackendPagination={true}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(0);
            }}
            onSearchChange={(search) => {
              setSearchQuery(search);
              setCurrentPage(0);
            }}
            isLoading={loading}
          />
        </div>
      </RoleProtection>
    </>
  );
}
