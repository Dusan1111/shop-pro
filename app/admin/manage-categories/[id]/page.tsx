"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./create-category.module.scss";
import { toast } from "react-toastify";

const BLOB_URL = process.env.NEXT_PUBLIC_BLOB_URL;

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");

  const mainImageFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      // Fetch the category data if editing
      const fetchCategory = async () => {
        try {
          const response = await fetch(`../api/categories/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            const category = data.data; // Correct access!

            setNewCategoryName(category.name ?? "");
            setNewCategoryDescription(category.description ?? "");
            setNewCategoryImage(category.image ?? null);
          } else {
            console.error("Failed to fetch category");
          }
        } catch (error) {
          console.error("Error fetching category:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCategory();
    } else {
      setLoading(false);
    }
  }, [isEditing, params.id]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMainImageClick = () => {
    if (mainImageFileRef.current) {
      mainImageFileRef.current.click();
    }
  };

  const uploadFile = async (file: File) => {
    const response = await fetch(`../api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      body: file,
    });
    if (!response.ok) throw new Error("Upload failed");
    const result = await response.json();
    return result.pathname;
  };


const handleSave = async () => {
  try {
    setActionLoading(true);

    let uploadedMainImage = newCategoryImage; // Use the existing
    const mainImageFile = mainImageFileRef.current?.files?.[0];
    if (mainImageFile) {
      uploadedMainImage = await uploadFile(mainImageFile); // Upload the new main image
    }

    const response = await fetch(`../api/categories`, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: isEditing ? params.id : undefined,
        name: newCategoryName,
        description: newCategoryDescription,
        image: uploadedMainImage, // Ensure the uploaded image URL is sent
      }),
    });

    const responseData = await response.json();
    if (response.ok) {
      toast.success(responseData.message || "Kategorija uspešno sačuvana!");
    } else {
      toast.error(responseData.message || "Došlo je do greške.");
    }
  } catch (error) {
    console.error("Greška prilikom čuvanja kategorije:", error);
    toast.error("Došlo je do greške prilikom čuvanja kategorije.");
  } finally {
    setActionLoading(false);
  }
};
  if (loading) {
    return (
      <><div className="page-title">
        <h1>{isEditing ? "Izmeni kategoriju" : "Dodaj kategoriju"}</h1>
      </div>

      <div className={styles.categoryPage}>
        {/* Main Image Skeleton */}
        <div className={styles.mainImageSection}>
          <div>Glavna slika</div>
          <div className={styles.imageWrapper}>
            <div className={styles.imageContainer}>
              <div className={styles.skeletonImage}></div>
            </div>
          </div>
        </div>

        {/* Form Fields Skeletons */}
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
      </div></>
    );
  }

  return (
    <><div className="page-title">
      <h1>{isEditing ? "Izmeni kategoriju" : "Dodaj kategoriju"}</h1>
    </div>

      <div className={styles.categoryPage}>
        {/* Main Image */}
        <div className={styles.mainImageSection}>
          <div>Glavna slika</div>
          <div className={styles.imageWrapper}>
            <div className={styles.imageContainer}>
              {mainImagePreview ? (
                <img src={mainImagePreview} alt="Preview" style={{ width: "100px" }} />

              ) : newCategoryImage ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <img src={`${BLOB_URL}/${newCategoryImage}`} alt="Glavna slika" style={{ width: "100px" }} />
                </div>

              ) : (
                <button className={styles.addImageButton} onClick={handleMainImageClick}>
                  +
                  <input
                    type="file"
                    ref={mainImageFileRef}
                    onChange={handleMainImageChange}
                    accept="image/*"
                  />
                </button>
              )
              }
            </div>
            {(mainImagePreview || newCategoryImage) && (
              <button onClick={handleMainImageClick}>
                Izmeni
                <input
                  type="file"
                  ref={mainImageFileRef}
                  onChange={handleMainImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </button>
            )}
          </div>
        </div>
        <div className={"floatingLabel"}>
          <input
            type="text"
            id="categoryName"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={actionLoading}
            required />
          <label htmlFor="categoryName">Naziv kategorije</label>
        </div>

        <div className={"floatingLabel"}>
          <textarea
            id="categoryDescription"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            disabled={actionLoading}
            required />
          <label htmlFor="categoryDescription">Opis kategorije</label>
        </div>

        <div className={`actions ${styles.actionsSection}`}>
          <button onClick={() => router.push("/admin/manage-products")} disabled={actionLoading}>
            Nazad
          </button>
          <button className={"save"} onClick={handleSave} disabled={actionLoading}>
            {actionLoading ? "Učitavanje..." : isEditing ? "Sačuvaj" : "Dodaj"}
          </button>
        </div>
      </div></>
  );
}