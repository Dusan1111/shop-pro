"use client";

import { useState, useEffect } from "react";
import styles from "./manage-categories.module.scss";
import TableComponent from "../shared/smart-table"; // Adjusted the import path
import { useRouter } from "next/navigation";
export default function ManageCategoriesPage() {

  interface Category {
    _id: string;
    name: string;
    image: string | null;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch("api/categories");

      if (!response.ok) {
        const errorText = await response.text(); // Read response body
        throw new Error(errorText);              // Pass it as message
      }

      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Server Error:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };
  const BLOB_URL = process.env.NEXT_PUBLIC_BLOB_URL;

  const customRenderers = {
    image: (category: Category) => (
      <img
        src={`${BLOB_URL}/${category.image}`}
        alt={category.name}
        style={{ width: "40px", height: "auto", objectFit: "cover" }}
      />
    ),
  };

  const handleApiResponse = async (apiCall: () => Promise<Response>) => {
    try {
      setActionLoading(true);
      const response = await apiCall();
      const data = await response.json(); // Read response body only once

      if (!response.ok) throw new Error(data.message || "Greška prilikom izvršavanja akcije!");

      setApiMessage(data.message || "Akcija uspešno izvršena!");
      return data; // Return parsed JSON data
    } catch (error) {
      setApiMessage((error as Error).message);
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCategory = () =>
    handleApiResponse(async () => {
      const response = await fetch(`api/categories?id=${categoryToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCategories((prev) => prev.filter((category) => category._id !== categoryToDelete));
      }
      return response;
    });

  return (
    <><div className="page-title">
      <h1>Upravljanje Kategorijama</h1>
    </div><div className={styles.manageCategoriesPage}>

        {error && <div className={styles.error}>{error.message}</div>}

        <button className={styles.btn} onClick={() => router.push(`/admin/manage-categories/new`)}
          disabled={actionLoading}>
          {actionLoading ? "Učitavanje..." : "Dodaj kategoriju"}
        </button>

        {loading ? (
          <p>Učitavanje kategorija...</p>
        ) : (
          <><TableComponent
            data={categories}
            columns={["ID", "Naziv", "Slika"]} // Pass column names here
            columnKeys={["_id", "name", "image"]} // Pass column names here
            onRowClick={(category) => router.push(`/admin/manage-categories/${category._id}`)}
            customRenderers={customRenderers}
            onRemove={(category: Category) => {
              setCategoryToDelete(category._id);
              setIsDeleting(true);
            } } /></>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Potvrdi brisanje</h2>
              {!apiMessage ? (
                <>
                  <p>Da li ste sigurni da želite da obrišete ovu kategoriju?</p>
                  <div className={styles.modalActions}>
                    <button onClick={() => setIsDeleting(false)} disabled={actionLoading}>
                      Nazad
                    </button>
                    <button onClick={deleteCategory} disabled={actionLoading}>
                      {actionLoading ? "Učitavanje..." : "Obriši"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>{apiMessage}</p>
                  <button className={styles.btn}
                    onClick={() => {
                      setApiMessage(null);
                      setIsDeleting(false);
                    } }
                  >
                    OK
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div></>
  );
}
