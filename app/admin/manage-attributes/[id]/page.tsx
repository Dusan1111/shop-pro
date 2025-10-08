"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./create-attribute.module.scss";
import { toast, ToastContainer } from "react-toastify";

export default function AttributePage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";

  const [attributeName, setAttributeName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      // Fetch the attribute data if editing
      const fetchAttribute = async () => {
        try {
          const response = await fetch(`../api/attributes/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            const attribute = data.data;

            setAttributeName(attribute.name ?? "");
          } else {
            console.error("Failed to fetch attribute");
          }
        } catch (error) {
          console.error("Error fetching attribute:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAttribute();
    } else {
      setLoading(false);
    }
  }, [isEditing, params.id]);

  const handleSave = async () => {
    try {
      setActionLoading(true);

      const response = await fetch(`../api/attributes`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: isEditing ? params.id : undefined,
          name: attributeName,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(responseData.message || "Atribut uspešno sačuvan!");
      } else {
        toast.error(responseData.message || "Došlo je do greške.");
      }
    } catch (error) {
      console.error("Greška prilikom čuvanja atributa:", error);
      toast.error("Došlo je do greške prilikom čuvanja atributa.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-title">
          <h1>{isEditing ? "Izmeni atribut" : "Dodaj atribut"}</h1>
        </div>

        <div className={styles.attributePage}>
          {/* Form Field Skeleton */}
          <div className="floatingLabel">
            <div className={styles.skeletonInput}></div>
          </div>

          {/* Actions Skeleton */}
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
        <h1>{isEditing ? "Izmeni atribut" : "Dodaj atribut"}</h1>
      </div>

      <div className={styles.attributePage}>
        <div className={"floatingLabel"}>
          <input
            type="text"
            id="attributeName"
            value={attributeName}
            onChange={(e) => setAttributeName(e.target.value)}
            disabled={actionLoading}
            required
          />
          <label htmlFor="attributeName">Naziv atributa</label>
        </div>

        <div className={`actions ${styles.actionsSection}`}>
          <button onClick={() => router.push("/admin/manage-products")} disabled={actionLoading}>
            Nazad
          </button>
          <button className={"save"} onClick={handleSave} disabled={actionLoading}>
            {actionLoading ? "Učitavanje..." : isEditing ? "Sačuvaj" : "Dodaj"}
          </button>
        </div>
      </div>
    </>
  );
}