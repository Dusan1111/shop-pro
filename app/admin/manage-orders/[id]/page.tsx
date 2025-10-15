"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./create-order.module.scss";
import { toast } from "react-toastify";

const BLOB_URL = process.env.NEXT_PUBLIC_BLOB_URL;

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`../api/orders/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data.data); // assuming { data: { ...order } }
      } catch (err) {
        toast.error("Greška prilikom učitavanja porudžbine.");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchOrder();
  }, [params.id]);

const handleQuantityChange = (itemIndex: number, newQty: number) => {
  setOrder((prev: any) => {
    const updatedOrderItems = prev.orderItems.map((item: any, idx: number) =>
      idx === itemIndex
        ? {
            ...item,
            quantity: newQty,
            subtotal: newQty * (item.product?.salePrice || item.product?.price || 0),
          }
        : item
    );
    // Calculate new total
    const newTotal = updatedOrderItems.reduce(
      (sum: number, item: any) => sum + (item.subtotal || (item.quantity * (item.product?.salePrice || item.product?.price || 0))),
      0
    );
    return { ...prev, orderItems: updatedOrderItems, total: newTotal };
  });
};

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("../api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();
      if (response.ok) {
        setOrder((prev: any) => ({
          ...prev,
          status,
        }));
        toast.success("Status uspešno ažuriran!");
      } else {
        console.error("Error updating status:", data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <><div className="page-title">
        <h1>Izmeni porudžbinu</h1>
      </div><div className={styles.orderPage}>
        <div className={styles.layoutColumns}>
          {/* Order Info Skeleton */}
          <div className={styles.orderInfo}>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>ID:</b>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>Ukupna cena:</b>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>Kupac:</b>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>Email kupca:</b>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>Adresa:</b>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>Grad:</b>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>Poštanski kod:</b>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>Dostava:</b>
              <div className={styles.skeletonText}></div>
            </div>
            <div className={styles.orderInfoRow}>
              <b className={styles.label}>Status:</b>
              <div className={styles.skeletonSelect}></div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <h2>Stavke porudžbine</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.orderTable}>
                <thead>
                  <tr>
                    <th>Slika</th>
                    <th>Proizvod</th>
                    <th>Količina</th>
                    <th>Plaćeno</th>
                    <th>Cena</th>
                    <th>Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(3)].map((_, idx) => (
                    <tr key={idx}>
                      <td><div className={styles.skeletonImage}></div></td>
                      <td><div className={styles.skeletonText}></div></td>
                      <td><div className={styles.skeletonInput}></div></td>
                      <td><div className={styles.skeletonText}></div></td>
                      <td><div className={styles.skeletonText}></div></td>
                      <td><div className={styles.skeletonText}></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="actions">
          <div className={styles.skeletonButton}></div>
        </div>
      </div></>
    );
  }

  if (!order) return <div>Porudžbina nije pronađena.</div>;

  return (
    <><div className="page-title">
      <h1>Izmeni porudžbinu</h1>
    </div><div className={styles.orderPage}>

        <div className={styles.layoutColumns}>
          <div className={styles.orderInfo}>
            <div className={styles.orderInfoRow}><b className={styles.label}>ID:</b>#{order._id}</div>
            <div className={styles.orderInfoRow}><b className={styles.label}>Ukupna cena:</b> {order.total} RSD </div>
            <div className={styles.orderInfoRow}><b className={styles.label}>Kupac:</b>{order.user}</div>
            <div className={styles.orderInfoRow}><b className={styles.label}>Email kupca:</b>{order.userEmail}</div>
            {order.address && <div className={styles.orderInfoRow}><b className={styles.label}>Adresa:</b>{order.address}</div>}
            {order.city && <div className={styles.orderInfoRow}><b className={styles.label}>Grad:</b>{order.city}</div>}
            {order.postalCode && <div className={styles.orderInfoRow}><b className={styles.label}>Poštanski kod:</b>{order.postalCode}</div>}
            {order.shipping !== undefined && <div className={styles.orderInfoRow}><b className={styles.label}>Dostava:</b>{order.shipping === 0 ? 'Besplatno' : `${order.shipping} RSD`}</div>}
            <div className={styles.orderInfoRow}><b className={styles.label}>Status:</b> <select
              value={order.status}
              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
            >
              <option value="U pripremi" style={{ color: 'orange' }}>
                U pripremi
              </option>
              <option value="Poslata" style={{ color: 'blue' }}>
                Poslata
              </option>
              <option value="Otkazana" style={{ color: 'red' }}>
                Otkazana
              </option>
            </select></div>
          </div>

          <div className={styles.rightColumn}>
            <h2>Stavke porudžbine</h2>
            <div className={styles.tableWrapper}> 
        <table className={styles.orderTable}>
          <thead>
            <tr>
              <th>Slika</th>
              <th>Proizvod</th>
              <th>Količina</th>
              <th>Plaćeno</th>
              <th>Cena</th>
              <th>Ukupno</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item: any, idx: number) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={item.product?.image
                      ? `${BLOB_URL}/${item.product.image}`
                      : "/placeholder.svg"}
                    alt={item.product?.name}
                    width={60}
                    height={60}
                    style={{ objectFit: "cover", borderRadius: 8 }} />
                </td>
                <td>{item.product?.name}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => handleQuantityChange(idx, Number(e.target.value))}
                    style={{ width: 60 }}
                    disabled={saving}
                    readOnly />
                </td>
                  <td>
                   {Number(item.subtotal / item.quantity).toFixed(0)} RSD
                </td>
                <td>
                  {Number(item.product?.salePrice ?? item.product?.price ?? 0).toFixed(0)} RSD
                </td>
                <td>
                   {(item.subtotal).toFixed(0)} RSD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
          </div>
        </div>

        <div className={"actions"}>
          <button onClick={() => router.push("/admin/manage-orders")} disabled={saving}>
            Nazad
          </button>
        </div>
      </div></>
  );
}