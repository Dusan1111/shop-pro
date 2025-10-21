"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import styles from "./login.module.scss";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    touched: {
      email: false,
      password: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setIsAdmin, setIsSuperAdmin, setFullName, setTenantName, setPermissions } = useAuth();

  const validate = () => {
    return {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      password: formData.password.length >= 3,
    };
  };

  const validation = validate();
  const isFormValid = validation.email && validation.password;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setFormData((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [name]: true,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("login/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (typeof errorData.error === "string") {
          setError(errorData.error);
        } else {
          setError(JSON.stringify(errorData.error));
        }
        setIsSubmitting(false);
      } else {
        // Check if user is super admin
        const meResponse = await fetch("/api/auth/me");
        if (meResponse.ok) {
          const userData = await meResponse.json();

          // Update auth state
          setIsAdmin(true);
          setFullName(userData.fullName || null);
          setTenantName(userData.tenantName || null);
          setPermissions(userData.permissions || []);

          // Use setTimeout to allow React to finish updating before navigation
          setTimeout(() => {
            if (userData.isSuperAdmin) {
              setIsSuperAdmin(true);
              router.push("/admin/manage-companies");
            } else {
              setIsSuperAdmin(false);
              router.push("/admin/manage-orders");
            }
          }, 100);
        } else {
          // Fallback if /api/auth/me fails
          setIsAdmin(true);
          setTimeout(() => {
            router.push("/admin/manage-orders");
          }, 100);
        }
      }
    } catch (err) {
      console.error("Greška prilikom logovanja:", err);
      setError("Došlo je do greške prilikom logovanja.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <h1>Uloguj se</h1>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <div className={styles.formGroup}>
          <span >Email</span>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {formData.touched.email && !validation.email && (
            <div className={styles.errorMessage}>
              Email nije u odgovarajućem formatu
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <span>Šifra</span>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {formData.touched.password && !validation.password && (
            <div className={styles.errorMessage}>
              Lozinka mora imati najmanje 3 karaktera
            </div>
          )}
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}

        <div className="actions">
          <button
            className="btn back"
            disabled={!isFormValid || isSubmitting}
          >
            Nazad
          </button>
          <button
            type="submit"
            className="btn"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Logovanje u toku..." : "Uloguj se"}
          </button>
        </div>

      </form>
    </div>
  );
}
