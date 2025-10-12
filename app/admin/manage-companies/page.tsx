"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./manage-companies.module.scss";
import TableComponent from "../shared/smart-table";
import RoleProtection from "../shared/role-protection";

export default function ManageCompaniesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'firme' | 'korisnici' | 'role'>('firme');

  // Tenants state
  interface Tenant {
    _id: string;
    name: string;
    dbName: string;
    isActive: boolean;
  }

  // Users state
  interface User {
    _id: string;
    email: string;
    tenantId?: string;
    tenantName?: string;
    roleId?: string;
    roleName?: string;
  }

  // Roles state
  interface Role {
    _id: string;
    name: string;
    description?: string;
    permissions?: string[];
  }

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'firme') {
      getTenants();
    } else if (activeTab === 'korisnici') {
      getUsers();
    } else if (activeTab === 'role') {
      getRoles();
    }
  }, [activeTab]);

  const getTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch("/admin/api/tenants");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setTenants(data.data || []);
    } catch (error) {
      console.error("Server Error:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/admin/api/users");

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

  const getRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/admin/api/roles");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      setRoles(data.data || []);
    } catch (error) {
      console.error("Server Error:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiResponse = async (apiCall: () => Promise<Response>) => {
    try {
      setActionLoading(true);
      const response = await apiCall();
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Greška prilikom izvršavanja akcije!");

      setApiMessage(data.message || "Akcija uspešno izvršena!");
      return data;
    } catch (error) {
      setApiMessage((error as Error).message);
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = () =>
    handleApiResponse(async () => {
      const endpoint = activeTab === 'firme' ? 'tenants' : activeTab === 'korisnici' ? 'users' : 'roles';
      const response = await fetch(`/admin/api/${endpoint}?id=${itemToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (activeTab === 'firme') {
          setTenants((prev) => prev.filter((item) => item._id !== itemToDelete));
        } else if (activeTab === 'korisnici') {
          setUsers((prev) => prev.filter((item) => item._id !== itemToDelete));
        } else {
          setRoles((prev) => prev.filter((item) => item._id !== itemToDelete));
        }
      }
      return response;
    });

  const customRenderers = {
    isActive: (tenant: Tenant) => (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: tenant.isActive ? '#d4edda' : '#f8d7da',
        color: tenant.isActive ? '#155724' : '#721c24'
      }}>
        {tenant.isActive ? 'Aktivan' : 'Neaktivan'}
      </span>
    ),
  };

  return (
    <RoleProtection allowSuperAdmin={true}>
      <div className="page-title">
        <h1>Upravljanje Kompanijama</h1>
      </div>
      <div className={styles.manageCompaniesPage}>
        {error && <div className={styles.error}>{error.message}</div>}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'firme' ? styles.active : ''}`}
            onClick={() => setActiveTab('firme')}
          >
            Firme
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'korisnici' ? styles.active : ''}`}
            onClick={() => setActiveTab('korisnici')}
          >
            Korisnici
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'role' ? styles.active : ''}`}
            onClick={() => setActiveTab('role')}
          >
            Role
          </button>
        </div>

        {loading ? (
          <p>Učitavanje...</p>
        ) : (
          <>
            {/* Firme Tab */}
            {activeTab === 'firme' && (
              <>
                <button
                  className={styles.btn}
                  onClick={() => router.push('/admin/manage-companies/new')}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Učitavanje..." : "Dodaj firmu"}
                </button>
                <TableComponent
                  data={tenants}
                  columns={["ID", "Naziv", "Ime Baze", "Status", ""]}
                  columnKeys={["_id", "name", "dbName", "isActive"]}
                  onRowClick={(tenant) => router.push(`/admin/manage-companies/${tenant._id}`)}
                  onRemove={(tenant: Tenant) => {
                    setItemToDelete(tenant._id);
                    setIsDeleting(true);
                  }}
                  customRenderers={customRenderers}
                />
              </>
            )}

            {/* Korisnici Tab */}
            {activeTab === 'korisnici' && (
              <>
                <button className={styles.btn} disabled={actionLoading}>
                  {actionLoading ? "Učitavanje..." : "Dodaj korisnika"}
                </button>
                <TableComponent
                  data={users}
                  columns={["ID", "Email", "Firma", "Rola", ""]}
                  columnKeys={["_id", "email", "tenantName", "roleName"]}
                  onRowClick={(user) => console.log('Edit user', user._id)}
                  onRemove={(user: User) => {
                    setItemToDelete(user._id);
                    setIsDeleting(true);
                  }}
                />
              </>
            )}

            {/* Role Tab */}
            {activeTab === 'role' && (
              <>
                <button className={styles.btn} disabled={actionLoading}>
                  {actionLoading ? "Učitavanje..." : "Dodaj rolu"}
                </button>
                <TableComponent
                  data={roles}
                  columns={["ID", "Naziv", "Opis"]}
                  columnKeys={["_id", "name", "description"]}
                  onRowClick={(role) => console.log('Edit role', role._id)}
                  onRemove={(role: Role) => {
                    setItemToDelete(role._id);
                    setIsDeleting(true);
                  }}
                />
              </>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Potvrdi brisanje</h2>
              {!apiMessage ? (
                <>
                  <p>Da li ste sigurni da želite da obrišete ovu stavku?</p>
                  <div className={styles.modalActions}>
                    <button onClick={() => setIsDeleting(false)} disabled={actionLoading}>
                      Nazad
                    </button>
                    <button onClick={deleteItem} disabled={actionLoading}>
                      {actionLoading ? "Učitavanje..." : "Obriši"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>{apiMessage}</p>
                  <button
                    className={styles.btn}
                    onClick={() => {
                      setApiMessage(null);
                      setIsDeleting(false);
                    }}
                  >
                    OK
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleProtection>
  );
}
