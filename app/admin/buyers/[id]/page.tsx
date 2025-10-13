"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./buyers-detail.module.scss";
import { toast } from 'react-toastify';
import RoleProtection from "../../shared/role-protection";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/admin/api/buyers/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const { data: user } = await res.json();

      // Handle name/lastname fields
      setFirstName(user.name || "");
      setLastName(user.lastname || "");
      setEmail(user.email ?? "");
      setAddress(user.address ?? "");
      setPostalCode(user.postalCode ?? "");
      setCity(user.city ?? "");
      setHasPassword(!!user.password);
    } catch (err) {
      console.error("Error fetching user:", err);
      toast.error("Greška prilikom učitavanja kupca.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleProtection allowSuperAdmin={false} requiredPermission="manage_buyers">
        <div className="page-title">
          <h1>Detalji kupca</h1>
        </div>
        <div className={styles.userDetailPage}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
          </div>
          <div className="actions">
            <div className={styles.skeletonButton}></div>
          </div>
        </div>
      </RoleProtection>
    );
  }

  return (
    <RoleProtection allowSuperAdmin={false} requiredPermission="manage_buyers">
      <div className="page-title">
        <h1>Detalji kupca</h1>
      </div>
      <div className={styles.userDetailPage}>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <label>Ime:</label>
            <span>{firstName || "-"}</span>
          </div>

          <div className={styles.detailItem}>
            <label>Prezime:</label>
            <span>{lastName || "-"}</span>
          </div>

          <div className={styles.detailItem}>
            <label>Email:</label>
            <span>{email || "-"}</span>
          </div>

          <div className={styles.detailItem}>
            <label>Adresa:</label>
            <span>{address || "-"}</span>
          </div>

          <div className={styles.detailItem}>
            <label>Poštanski kod:</label>
            <span>{postalCode || "-"}</span>
          </div>

          <div className={styles.detailItem}>
            <label>Grad:</label>
            <span>{city || "-"}</span>
          </div>

          <div className={styles.detailItem}>
            <label>Lozinka:</label>
            <span>{hasPassword ? "••••••••" : "-"}</span>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => router.push("/admin/buyers")}>
            Nazad
          </button>
        </div>
      </div>
    </RoleProtection>
  );
}
