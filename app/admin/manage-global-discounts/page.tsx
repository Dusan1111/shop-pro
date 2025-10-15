"use client";

import { useState, useEffect } from "react";
import styles from "./manage-global-discounts.module.scss";
import TableComponent from "../shared/smart-table";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function PopustiPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'global-discounts' | 'vouchers' | 'coupons'>('global-discounts');

  interface GlobalDiscount {
    _id: string;
    name: string;
    description: string;
    type: string;
    applyTo: string;
    minPurchaseAmount?: number;
    discountPercentage?: number;
    isActive: boolean;
  }

  interface Coupon {
    _id: string;
    code: string;
    name: string;
    description?: string;
    type: string;
    discountValue?: number;
    minPurchaseAmount?: number;
    maxUsageCount?: number;
    usageCount: number;
    expiryDate?: string;
    isActive: boolean;
  }

  const [globalDiscounts, setGlobalDiscounts] = useState<GlobalDiscount[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'global-discounts') {
        await getGlobalDiscounts();
      } else if (activeTab === 'coupons') {
        await getCoupons();
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const getGlobalDiscounts = async () => {
    try {
      const response = await fetch("/admin/api/global-discounts");
      if (!response.ok) throw new Error("Greška prilikom dobavljanja globalnih popusta!");
      const data = await response.json();
      setGlobalDiscounts(data.data || []);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const getCoupons = async () => {
    try {
      const response = await fetch("/admin/api/coupons");
      if (!response.ok) throw new Error("Greška prilikom dobavljanja kupona!");
      const data = await response.json();
      setCoupons(data.data || []);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const handleApiResponse = async (apiCall: () => Promise<Response>) => {
    try {
      setActionLoading(true);
      const response = await apiCall();
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Greška prilikom izvršavanja akcije!");

      setApiMessage(data.message || "Akcija uspešno izvršena!");
      return data;
    } catch (error) {
      setApiMessage((error as Error).message);
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteGlobalDiscount = async () => {
    const response = await handleApiResponse(async () => {
      return fetch(`/admin/api/global-discounts?id=${programToDelete}`, {
        method: "DELETE",
      });
    });

    if (response) {
      setGlobalDiscounts((prev) => prev.filter((program) => program._id !== programToDelete));
    }
  };

  const deleteCoupon = async () => {
    const response = await handleApiResponse(async () => {
      return fetch(`/admin/api/coupons?id=${programToDelete}`, {
        method: "DELETE",
      });
    });

    if (response) {
      setCoupons((prev) => prev.filter((coupon) => coupon._id !== programToDelete));
    }
  };

  const customRenderers = {
    isActive: (program: GlobalDiscount) => (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: program.isActive ? '#d4edda' : '#f8d7da',
        color: program.isActive ? '#155724' : '#721c24'
      }}>
        {program.isActive ? 'Aktivan' : 'Neaktivan'}
      </span>
    ),
    type: (program: GlobalDiscount) => {
      if (program.type === 'freeShipping') return 'Besplatna dostava';
      if (program.type === 'percentage') return 'Procenat popusta';
      if (program.type === 'fixed') return 'Fiksni popust';
      return program.type;
    },
    applyTo: (program: GlobalDiscount) => {
      if (program.applyTo === 'specific') return 'Pojedinačni proizvod';
      if (program.applyTo === 'global') return 'Globalni';
      return program.applyTo || 'Globalni';
    },
    discountPercentage: (program: GlobalDiscount) => {
      if (!program.discountPercentage) return 'N/A';
      if (program.type === 'fixed') return `${program.discountPercentage} RSD`;
      return `${program.discountPercentage}%`;
    },
    minPurchaseAmount: (program: GlobalDiscount) => (
      program.minPurchaseAmount ? `${program.minPurchaseAmount} RSD` : 'N/A'
    ),
  };

  const couponRenderers = {
    isActive: (coupon: Coupon) => (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: coupon.isActive ? '#d4edda' : '#f8d7da',
        color: coupon.isActive ? '#155724' : '#721c24'
      }}>
        {coupon.isActive ? 'Aktivan' : 'Neaktivan'}
      </span>
    ),
    type: (coupon: Coupon) => {
      if (coupon.type === 'percentage') return 'Procenat';
      if (coupon.type === 'fixed') return 'Fiksni';
      return coupon.type;
    },
    discountValue: (coupon: Coupon) => {
      if (!coupon.discountValue) return 'N/A';
      if (coupon.type === 'fixed') return `${coupon.discountValue} RSD`;
      return `${coupon.discountValue}%`;
    },
    minPurchaseAmount: (coupon: Coupon) => (
      coupon.minPurchaseAmount ? `${coupon.minPurchaseAmount} RSD` : 'N/A'
    ),
    usageCount: (coupon: Coupon) => {
      const max = coupon.maxUsageCount || '∞';
      return `${coupon.usageCount} / ${max}`;
    },
    expiryDate: (coupon: Coupon) => {
      if (!coupon.expiryDate) return 'Bez isteka';
      return new Date(coupon.expiryDate).toLocaleDateString('sr-RS');
    },
  };

  return (
    <>
      <div className="page-title">
        <h1>Popusti</h1>
      </div>

      <div className={styles.popustiPage}>
        <div className={styles.tabCard}>
          {/* Tab Headers */}
          <div className={styles.tabHeaders}>
            {hasPermission('manage_discounts') && (
              <button
                className={`${styles.tabButton} ${activeTab === 'global-discounts' ? styles.active : ''}`}
                onClick={() => setActiveTab('global-discounts')}
              >
                Popusti
              </button>
            )}
            {hasPermission('manage_vouchers') && (
              <button
                className={`${styles.tabButton} ${activeTab === 'vouchers' ? styles.active : ''}`}
                onClick={() => setActiveTab('vouchers')}
              >
                Vaučeri
              </button>
            )}
            {hasPermission('manage_coupons') && (
              <button
                className={`${styles.tabButton} ${activeTab === 'coupons' ? styles.active : ''}`}
                onClick={() => setActiveTab('coupons')}
              >
                Kuponi
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'global-discounts' && hasPermission('manage_discounts') ? (
              <>
                <button
                  className={styles.addButton}
                  onClick={() => router.push(`/admin/manage-global-discounts/new`)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Učitavanje..." : "Dodaj popust"}
                </button>

                {loading ? (
                  <p>Učitavanje globalnih popusta...</p>
                ) : (
                  <TableComponent
                    data={globalDiscounts}
                    columns={["ID", "Naziv", "Tip", "Namena", "Min. iznos", "Popust", "Status", ""]}
                    columnKeys={["_id", "name", "type", "applyTo", "minPurchaseAmount", "discountPercentage", "isActive"]}
                    onRowClick={(program) => router.push(`/admin/manage-global-discounts/${program._id}`)}
                    onRemove={(program: GlobalDiscount) => {
                      setProgramToDelete(program._id);
                      setIsDeleting(true);
                    }}
                    customRenderers={customRenderers}
                  />
                )}
              </>
            ) : activeTab === 'vouchers' && hasPermission('manage_vouchers') ? (
              <>
                <button
                  className={styles.addButton}
                  onClick={() => router.push(`/admin/manage-vouchers/new`)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Učitavanje..." : "Dodaj vaučer"}
                </button>

                {loading ? (
                  <p>Učitavanje vaučera...</p>
                ) : (
                  <p>Vaučeri funkcionalnost dolazi uskoro...</p>
                )}
              </>
            ) : activeTab === 'coupons' && hasPermission('manage_coupons') ? (
              <>
                <button
                  className={styles.addButton}
                  onClick={() => router.push(`/admin/manage-coupons/new`)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Učitavanje..." : "Dodaj kupon"}
                </button>

                {loading ? (
                  <p>Učitavanje kupona...</p>
                ) : (
                  <TableComponent
                    data={coupons}
                    columns={["ID", "Kod", "Naziv", "Tip", "Vrednost", "Min. iznos", "Upotreba", "Ističe", "Status", ""]}
                    columnKeys={["_id", "code", "name", "type", "discountValue", "minPurchaseAmount", "usageCount", "expiryDate", "isActive"]}
                    onRowClick={(coupon) => router.push(`/admin/manage-coupons/${coupon._id}`)}
                    onRemove={(coupon: Coupon) => {
                      setProgramToDelete(coupon._id);
                      setIsDeleting(true);
                    }}
                    customRenderers={couponRenderers}
                  />
                )}
              </>
            ) : (
              <p>Nemate permisiju za pristup ovom tabu.</p>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Potvrdi brisanje</h2>
              {!apiMessage ? (
                <>
                  <p>Da li ste sigurni da želite da obrišete {activeTab === 'coupons' ? 'ovaj kupon' : 'ovaj popust'}?</p>
                  <div className={styles.modalActions}>
                    <button onClick={() => setIsDeleting(false)} disabled={actionLoading}>
                      Nazad
                    </button>
                    <button
                      onClick={activeTab === 'coupons' ? deleteCoupon : deleteGlobalDiscount}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Učitavanje..." : "Obriši"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>{apiMessage}</p>
                  <button
                    className={styles.btn}
                    onClick={() => {
                      setApiMessage(null);
                      setIsDeleting(false);
                    }}
                  >
                    OK
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
