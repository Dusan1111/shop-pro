"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./create-attribute-value.module.scss";
import { toast, ToastContainer } from "react-toastify";

interface Attribute {
  _id: string;
  name: string;
}

export default function AttributeValuePage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";

  const [attributeId, setAttributeId] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all attributes for dropdown
    const fetchAttributes = async () => {
      try {
        const response = await fetch("../api/attributes");
        if (response.ok) {
          const data = await response.json();
          setAttributes(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching attributes:", error);
      }
    };

    fetchAttributes();

    if (isEditing) {
      // Fetch the attribute value data if editing
      const fetchAttributeValue = async () => {
        try {
          const response = await fetch(`../api/attribute-values/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            const attributeValue = data.data;

            setAttributeId(attributeValue.attributeId?.toString() ?? "");
            setValue(attributeValue.name ?? "");
            setDescription(attributeValue.description ?? "");
          } else {
            console.error("Failed to fetch attribute value");
          }
        } catch (error) {
          console.error("Error fetching attribute value:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAttributeValue();
    } else {
      setLoading(false);
    }
  }, [isEditing, params.id]);

  const handleSave = async () => {
    try {
      setActionLoading(true);

      if (!attributeId) {
        toast.error("Molimo izaberite atribut!");
        return;
      }

      if (!value) {
        toast.error("Vrednost atributa je obavezna!");
        return;
      }

      const response = await fetch(`../api/attribute-values`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: isEditing ? params.id : undefined,
          attributeId,
          name: value,
          description,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(responseData.message || "Vrednost atributa uspešno sačuvana!");
      } else {
        toast.error(responseData.message || "Došlo je do greške.");
      }
    } catch (error) {
      console.error("Greška prilikom čuvanja vrednosti atributa:", error);
      toast.error("Došlo je do greške prilikom čuvanja vrednosti atributa.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-title">
          <h1>{isEditing ? "Izmeni vrednost atributa" : "Dodaj vrednost atributa"}</h1>
        </div>

        <div className={styles.attributeValuePage}>
          <button
            className={styles.backButtonTop}
            onClick={() => router.back()}
            disabled={actionLoading}
          >
            Nazad
          </button>
          {/* Form Fields Skeletons */}
          <div className="floatingLabel">
            <div className={styles.skeletonSelect}></div>
          </div>

          <div className="floatingLabel">
            <div className={styles.skeletonInput}></div>
          </div>

          <div className="floatingLabel">
            <div className={styles.skeletonTextarea}></div>
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
        <h1>{isEditing ? "Izmeni vrednost atributa" : "Dodaj vrednost atributa"}</h1>
      </div>

      <div className={styles.attributeValuePage}>
        <button
          className={styles.backButtonTop}
          onClick={() => router.push("/admin/manage-attribute-values")}
          disabled={actionLoading}
        >
          Nazad
        </button>
        <div className={"floatingLabel"}>
          <select
            id="attributeSelect"
            value={attributeId}
            onChange={(e) => setAttributeId(e.target.value)}
            disabled={actionLoading}
            required
          >
            <option value="">Izaberite atribut</option>
            {attributes.map((attribute) => (
              <option key={attribute._id} value={attribute._id}>
                {attribute.name}
              </option>
            ))}
          </select>
          <label htmlFor="attributeSelect">Atribut</label>
        </div>

        <div className={"floatingLabel"}>
          <input
            type="text"
            id="attributeValue"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={actionLoading}
            required
          />
          <label htmlFor="attributeValue">Vrednost</label>
        </div>

        <div className={"floatingLabel"}>
          <textarea
            id="attributeDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={actionLoading}
            rows={4}
          />
          <label htmlFor="attributeDescription">Opis (opciono)</label>
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