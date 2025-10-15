"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./global-discount-form.module.scss";
import { toast } from 'react-toastify';
import MultiSelect from "../../shared/multi-select";

export default function GlobalDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";

  const [programName, setGlobalDiscountName] = useState("");
  const [programDescription, setGlobalDiscountDescription] = useState("");
  const [programType, setGlobalDiscountType] = useState("");
  const [applyTo, setApplyTo] = useState("global");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number | string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number | string>("");
  const [isActive, setIsActive] = useState(true);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing) await fetchGlobalDiscount();
      await fetchProducts();
      setLoading(false);
    };
    fetchData();
  }, [isEditing, params.id]);

  const fetchGlobalDiscount = async () => {
    try {
      const res = await fetch(`/admin/api/global-discounts/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch global discount");
      const { data: globalDiscount } = await res.json();
      setGlobalDiscountName(globalDiscount.name ?? "");
      setGlobalDiscountDescription(globalDiscount.description ?? "");
      setGlobalDiscountType(globalDiscount.type ?? "");
      setApplyTo(globalDiscount.applyTo ?? "global");
      setMinPurchaseAmount(globalDiscount.minPurchaseAmount ?? "");
      setDiscountPercentage(globalDiscount.discountPercentage ?? "");
      setIsActive(globalDiscount.isActive ?? true);
      setProductIds(globalDiscount.productIds ?? []);
    } catch (err) {
      console.error("Error fetching global discount:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/admin/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const { data: productsData } = await res.json();
      setProducts(productsData ?? []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);

      const response = await fetch(`/admin/api/global-discounts`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEditing ? params.id : undefined,
          name: programName,
          description: programDescription,
          type: programType,
          applyTo: applyTo,
          minPurchaseAmount: minPurchaseAmount || undefined,
          discountPercentage: discountPercentage || undefined,
          isActive: isActive,
          productIds: applyTo === "specific" ? productIds : [],
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(responseData.message || "Popust uspešno sačuvan!");
        router.push("/admin/manage-global-discounts");
      } else {
        toast.error(responseData.message || "Došlo je do greške.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Došlo je do greške prilikom čuvanja globalnog popusta.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-title">
          <h1>{isEditing ? "Izmeni popust" : "Dodaj popust"}</h1>
        </div>
        <div className={styles.globalDiscountFormPage}>
          <button
            className={styles.backButtonTop}
            onClick={() => router.back()}
            disabled={actionLoading}
          >
            Nazad
          </button>
          <div className={styles.formGrid}>
            <div className={styles.toggleContainer}>
              <span className={styles.toggleLabel}>Aktivan</span>
              <div className={styles.skeletonToggle}></div>
            </div>
            <div className={`floatingLabel ${styles.fullWidth}`}>
              <div className={styles.skeletonInput}></div>
            </div>
            <div className={`floatingLabel ${styles.fullWidth}`}>
              <div className={styles.skeletonTextarea}></div>
            </div>
            <div className="floatingLabel">
              <div className={styles.skeletonSelect}></div>
            </div>
            <div className="floatingLabel">
              <div className={styles.skeletonSelect}></div>
            </div>
            <div className="floatingLabel">
              <div className={styles.skeletonInput}></div>
            </div>
            <div className="floatingLabel">
              <div className={styles.skeletonInput}></div>
            </div>
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
        <h1>{isEditing ? "Izmeni popust" : "Dodaj popust"}</h1>
      </div>
      <div className={styles.globalDiscountFormPage}>
        <button
          className={styles.backButtonTop}
          onClick={() => router.back()}
          disabled={actionLoading}
        >
          Nazad
        </button>
        <div className={styles.formGrid}>
          {/* Form Fields */}
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

          <div className={`floatingLabel ${styles.fullWidth}`}>
            <input
              type="text"
              id="programName"
              value={programName}
              onChange={(e) => setGlobalDiscountName(e.target.value)}
              disabled={actionLoading}
              required
            />
            <label htmlFor="programName">Naziv programa</label>
          </div>

          <div className={`floatingLabel ${styles.fullWidth}`}>
            <textarea
              id="programDescription"
              value={programDescription}
              onChange={(e) => setGlobalDiscountDescription(e.target.value)}
              disabled={actionLoading}
              required
            />
            <label htmlFor="programDescription">Opis programa</label>
          </div>

          <div className="floatingLabel">
            <select
              className="create-select"
              id="programType"
              value={programType}
              onChange={(e) => {
                const newType = e.target.value;
                setGlobalDiscountType(newType);
                if (newType === "freeShipping") {
                  setApplyTo("global");
                  setDiscountPercentage("");
                }
                if (newType !== "percentage" && newType !== "fixed") {
                  setDiscountPercentage("");
                }
              }}
              disabled={actionLoading}
              required
            >
              <option value="">Izaberi tip programa</option>
              <option value="percentage">Procenat popusta</option>
              <option value="fixed">Fiksni popust</option>
              <option value="freeShipping">Besplatna dostava</option>
            </select>
            <label htmlFor="programType">Tip programa</label>
          </div>

          <div className="floatingLabel">
            <select
              className="create-select"
              id="applyTo"
              value={applyTo}
              onChange={(e) => setApplyTo(e.target.value)}
              disabled={actionLoading}
              required
            >
              <option value="global">Globalni</option>
              <option value="specific" disabled={programType === "freeShipping"}>
                Pojedinačni proizvod
              </option>
            </select>
            <label htmlFor="applyTo">Namena</label>
          </div>

          {applyTo === "specific" && (
            <div className={`${styles.productsSection} ${styles.fullWidth}`}>
              <div className={styles.sectionLabel}>Proizvodi</div>
              <MultiSelect
                options={products}
                selectedValues={productIds}
                onSelectionChange={setProductIds}
                placeholder="Izaberite proizvode..."
                searchPlaceholder="Pretražite proizvode..."
                disabled={actionLoading}
              />
            </div>
          )}

          {applyTo !== "specific" && (
            <div className="floatingLabel">
              <input
                type="number"
                id="minPurchaseAmount"
                value={minPurchaseAmount}
                onChange={(e) => setMinPurchaseAmount(e.target.value)}
                disabled={actionLoading}
              />
              <label htmlFor="minPurchaseAmount">Minimalan iznos kupovine (RSD)</label>
            </div>
          )}

          {programType !== "freeShipping" && (
            <div className="floatingLabel">
              <input
                type="number"
                id="discountPercentage"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                disabled={actionLoading}
              />
              <label htmlFor="discountPercentage">
                {programType === "percentage" ? "Procenat popusta (%)" : "Popust u RSD"}
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`actions ${styles.actionsSection}`}>
          <button onClick={() => router.push("/admin/manage-global-discounts")} disabled={actionLoading}>
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
