"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "../../manage-global-discounts/[id]/global-discount-form.module.scss";
import { toast } from 'react-toastify';

export default function CouponPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [discountValue, setDiscountValue] = useState<number | string>("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number | string>("");
  const [maxUsageCount, setMaxUsageCount] = useState<number | string>("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchCoupon();
    }
  }, [isEditing, params.id]);

  const fetchCoupon = async () => {
    try {
      const res = await fetch(`/admin/api/coupons/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch coupon");
      const { data: coupon } = await res.json();
      setCode(coupon.code ?? "");
      setName(coupon.name ?? "");
      setDescription(coupon.description ?? "");
      setType(coupon.type ?? "");
      setDiscountValue(coupon.discountValue ?? "");
      setMinPurchaseAmount(coupon.minPurchaseAmount ?? "");
      setMaxUsageCount(coupon.maxUsageCount ?? "");
      setExpiryDate(coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : "");
      setIsActive(coupon.isActive ?? true);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching coupon:", err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);

      const response = await fetch(`/admin/api/coupons`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: isEditing ? params.id : undefined,
          code: code,
          name: name,
          description: description || undefined,
          type: type,
          discountValue: discountValue || undefined,
          minPurchaseAmount: minPurchaseAmount || undefined,
          maxUsageCount: maxUsageCount || undefined,
          expiryDate: expiryDate || undefined,
          isActive: isActive,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(responseData.message || "Kupon uspešno sačuvan!");
        router.push("/admin/manage-global-discounts");
      } else {
        toast.error(responseData.message || "Došlo je do greške.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      toast.error("Došlo je do greške prilikom čuvanja kupona.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-title">
          <h1>{isEditing ? "Izmeni kupon" : "Dodaj kupon"}</h1>
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
            <div className="floatingLabel">
              <div className={styles.skeletonInput}></div>
            </div>
            <div className="floatingLabel">
              <div className={styles.skeletonInput}></div>
            </div>
            <div className={`floatingLabel ${styles.fullWidth}`}>
              <div className={styles.skeletonTextarea}></div>
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
        <h1>{isEditing ? "Izmeni kupon" : "Dodaj kupon"}</h1>
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

          <div className="floatingLabel">
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={actionLoading}
              required
            />
            <label htmlFor="code">Kod kupona</label>
          </div>

          <div className="floatingLabel">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={actionLoading}
              required
            />
            <label htmlFor="name">Naziv kupona</label>
          </div>

          <div className={`floatingLabel ${styles.fullWidth}`}>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={actionLoading}
            />
            <label htmlFor="description">Opis</label>
          </div>

          <div className="floatingLabel">
            <select
              className="create-select"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={actionLoading}
              required
            >
              <option value="">Izaberi tip kupona</option>
              <option value="percentage">Procenat popusta</option>
              <option value="fixed">Fiksni popust</option>
            </select>
            <label htmlFor="type">Tip kupona</label>
          </div>

          {type && (
            <div className="floatingLabel">
              <input
                type="number"
                id="discountValue"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={actionLoading}
                required
              />
              <label htmlFor="discountValue">
                {type === "percentage" ? "Procenat popusta (%)" : "Popust u RSD"}
              </label>
            </div>
          )}

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

          <div className="floatingLabel">
            <input
              type="number"
              id="maxUsageCount"
              value={maxUsageCount}
              onChange={(e) => setMaxUsageCount(e.target.value)}
              disabled={actionLoading}
            />
            <label htmlFor="maxUsageCount">Maksimalan broj upotreba po kupcu</label>
          </div>

          <div className="floatingLabel">
            <input
              type="date"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={actionLoading}
            />
            <label htmlFor="expiryDate">Datum isteka</label>
          </div>
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
