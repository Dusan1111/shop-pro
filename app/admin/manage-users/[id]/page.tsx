"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./user-form.module.scss";
import { toast } from 'react-toastify';

export default function UserPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [tenants, setTenants] = useState<{ _id: string; name: string }[]>([]);
  const [roles, setRoles] = useState<{ _id: string; name: string }[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    const fetchData = async () => {
      await fetchTenants();
      await fetchRoles();
      if (isEditing) await fetchUser();
      setLoading(false);
    };
    fetchData();
  }, [isEditing, params.id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/admin/api/users/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const { data: user } = await res.json();
      setFullName(user.fullName ?? "");
      setEmail(user.email ?? "");
      setTenantId(user.tenantId ?? "");
      setRoleId(user.roleId ?? "");
    } catch (err) {
      console.error("Error fetching user:", err);
      toast.error("Greška prilikom učitavanja korisnika.");
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch("/admin/api/tenants");
      if (!res.ok) throw new Error("Failed to fetch tenants");
      const { data } = await res.json();
      setTenants(data ?? []);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/admin/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const { data } = await res.json();
      // Filter out super_admin role
      const filteredRoles = data.filter((role: any) => role.name !== "super_admin");
      setRoles(filteredRoles ?? []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);

      const response = await fetch(`/admin/api/users`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEditing ? params.id : undefined,
          fullName: fullName || undefined,
          email: email,
          password: password || undefined,
          tenantId: tenantId || undefined,
          roleId: roleId || undefined,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(responseData.message || "Korisnik uspešno sačuvan!");
        router.push("/admin/manage-companies");
      } else {
        toast.error(responseData.message || "Došlo je do greške.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Došlo je do greške prilikom čuvanja korisnika.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-title">
          <h1>{isEditing ? "Izmeni korisnika" : "Dodaj korisnika"}</h1>
        </div>
        <div className={styles.userFormPage}>
          <div className="floatingLabel">
            <div className={styles.skeletonInput}></div>
          </div>
          <div className="floatingLabel">
            <div className={styles.skeletonInput}></div>
          </div>
          <div className="floatingLabel">
            <div className={styles.skeletonInput}></div>
          </div>
          <div className="floatingLabel">
            <div className={styles.skeletonSelect}></div>
          </div>
          <div className="floatingLabel">
            <div className={styles.skeletonSelect}></div>
          </div>
          <div className={`actions ${styles.actionsSection}`}>
            <div className={styles.skeletonButton}></div>
            <div className={styles.skeletonButton}></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-title">
        <h1>{isEditing ? "Izmeni korisnika" : "Dodaj korisnika"}</h1>
      </div>
      <div className={styles.userFormPage}>
        {/* Form Fields */}
        <div className="floatingLabel">
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={actionLoading}
          />
          <label htmlFor="fullName">Ime i prezime</label>
        </div>

        <div className="floatingLabel">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={actionLoading}
            required
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="floatingLabel">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={actionLoading}
            placeholder={isEditing ? "Ostavite prazno da zadržite staru lozinku" : ""}
          />
          <label htmlFor="password">Lozinka{!isEditing && " *"}</label>
        </div>

        <div className="floatingLabel">
          <select
            className="create-select"
            id="tenantId"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            disabled={actionLoading}
          >
            <option value="">Izaberi firmu</option>
            {tenants.map((tenant) => (
              <option key={tenant._id} value={tenant._id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <label htmlFor="tenantId">Firma</label>
        </div>

        <div className="floatingLabel">
          <select
            className="create-select"
            id="roleId"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={actionLoading}
          >
            <option value="">Izaberi rolu</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
          <label htmlFor="roleId">Rola</label>
        </div>

        {/* Actions */}
        <div className={`actions ${styles.actionsSection}`}>
          <button onClick={() => router.push("/admin/manage-companies")} disabled={actionLoading}>
            Nazad
          </button>
          <button className="save" onClick={handleSave} disabled={actionLoading}>
            {actionLoading ? "Učitavanje..." : isEditing ? "Sačuvaj" : "Dodaj"}
          </button>
        </div>
      </div>
    </>
  );
}
