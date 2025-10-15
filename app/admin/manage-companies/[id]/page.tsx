"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./tenant-form.module.scss";
import { toast } from 'react-toastify';

export default function TenantPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";

  const [tenantName, setTenantName] = useState("");
  const [dbName, setDbName] = useState("");
  const [gmailUser, setGmailUser] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  const permissionGroups = [
    {
      tab: "Proizvodi",
      permissions: [
        { value: "manage_products", label: "Proizvodi" },
        { value: "manage_categories", label: "Kategorije" },
        { value: "manage_attributes", label: "Atributi" },
        { value: "manage_attribute_values", label: "Vrednosti atributa" },
      ]
    },
    {
      tab: "Popusti",
      permissions: [
        { value: "manage_discounts", label: "Globalni popusti" },
        { value: "manage_vouchers", label: "Vaučeri" },
        { value: "manage_coupons", label: "Kuponi" },
      ]
    },
    {
      tab: "Porudžbine",
      permissions: [
        { value: "manage_orders", label: "Porudžbine" },
      ]
    },
    {
      tab: "Kupci",
      permissions: [
        { value: "manage_buyers", label: "Upravljanje kupcima" },
        { value: "manage_loyalty_program", label: "Program lojalnosti" },
      ]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing) await fetchTenant();
      setLoading(false);
    };
    fetchData();
  }, [isEditing, params.id]);

  const fetchTenant = async () => {
    try {
      const res = await fetch(`/admin/api/tenants/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch tenant");
      const { data: tenant } = await res.json();
      setTenantName(tenant.name ?? "");
      setDbName(tenant.dbName ?? "");
      setGmailUser(tenant.gmailUser ?? "");
      setGmailAppPassword(tenant.gmailAppPassword ?? "");
      setPhoneNumber(tenant.phoneNumber ?? "");
      setIsActive(tenant.isActive ?? true);
      setPermissions(tenant.permissions ?? []);
    } catch (err) {
      console.error("Error fetching tenant:", err);
      toast.error("Greška prilikom učitavanja firme.");
    }
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);

      const response = await fetch(`/admin/api/tenants`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEditing ? params.id : undefined,
          name: tenantName,
          dbName: dbName,
          gmailUser: gmailUser || undefined,
          gmailAppPassword: gmailAppPassword || undefined,
          phoneNumber: phoneNumber || undefined,
          isActive: isActive,
          permissions: permissions,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(responseData.message || "Firma uspešno sačuvana!");
        router.push("/admin/manage-companies");
      } else {
        toast.error(responseData.message || "Došlo je do greške.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Došlo je do greške prilikom čuvanja firme.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-title">
          <h1>{isEditing ? "Izmeni firmu" : "Dodaj firmu"}</h1>
        </div>
        <div className={styles.tenantFormPage}>
          <div className="floatingLabel">
            <div className={styles.skeletonInput}></div>
          </div>
          <div className="floatingLabel">
            <div className={styles.skeletonInput}></div>
          </div>
          {!isEditing && (
            <>
              <div className="floatingLabel">
                <div className={styles.skeletonInput}></div>
              </div>
              <div className="floatingLabel">
                <div className={styles.skeletonInput}></div>
              </div>
            </>
          )}
          <div className="floatingLabel">
            <div className={styles.skeletonInput}></div>
          </div>
          <div className={styles.permissionsContainer}>
            <div className={styles.skeletonLabel}></div>
            <div className={styles.skeletonPermissions}></div>
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
        <h1>{isEditing ? "Izmeni firmu" : "Dodaj firmu"}</h1>
      </div>
      <div className={styles.tenantFormPage}>
        {/* Form Fields */}
        <div className="floatingLabel">
          <input
            type="text"
            id="tenantName"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            disabled={actionLoading}
            required
          />
          <label htmlFor="tenantName">Naziv firme</label>
        </div>

        <div className="floatingLabel">
          <input
            type="text"
            id="dbName"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
            disabled={actionLoading || isEditing}
            required
          />
          <label htmlFor="dbName">Ime baze podataka</label>
        </div>

        {!isEditing && (
          <>
            <div className="floatingLabel">
              <input
                type="email"
                id="gmailUser"
                value={gmailUser}
                onChange={(e) => setGmailUser(e.target.value)}
                disabled={actionLoading}
              />
              <label htmlFor="gmailUser">Gmail korisnik (Email)</label>
            </div>

            <div className="floatingLabel">
              <input
                type="password"
                id="gmailAppPassword"
                value={gmailAppPassword}
                onChange={(e) => setGmailAppPassword(e.target.value)}
                disabled={actionLoading}
              />
              <label htmlFor="gmailAppPassword">Gmail App lozinka</label>
            </div>
          </>
        )}

        <div className="floatingLabel">
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={actionLoading}
          />
          <label htmlFor="phoneNumber">Broj telefona</label>
        </div>

        <div className={styles.permissionsContainer}>
          <label className={styles.permissionsLabel}>Permisije</label>
          <div className={styles.permissionsGroups}>
            {permissionGroups.map((group) => (
              <div key={group.tab} className={styles.permissionGroup}>
                <div className={styles.groupHeader}>{group.tab}</div>
                <div className={styles.permissionsGrid}>
                  {group.permissions.map((permission) => (
                    <div key={permission.value} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        id={permission.value}
                        value={permission.value}
                        checked={permissions.includes(permission.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPermissions([...permissions, permission.value]);
                          } else {
                            setPermissions(permissions.filter(p => p !== permission.value));
                          }
                        }}
                        disabled={actionLoading}
                      />
                      <label htmlFor={permission.value}>{permission.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.toggleContainer}>
          <span className={styles.toggleLabel}>Aktivan</span>
          <div className={styles.toggle} onClick={() => !actionLoading && setIsActive(!isActive)}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => {}}
              disabled={actionLoading}
              readOnly
            />
            <span className={styles.toggleSlider}></span>
          </div>
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
