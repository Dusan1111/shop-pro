"use client";

import { useState, useEffect } from "react";
import styles from "./manage-orders.module.scss";
import TableComponent from "../shared/smart-table";
import { useRouter } from "next/navigation";

export default function ManageOrdersPage() {
  interface Order {
    _id: string;
    orderTime: string;
    status: string;
    user: string;
    userEmail: string;
    userPhone: string;
    total: number;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("api/orders", { method: "GET" });
        const data = await response.json();
        if (response.ok) {
          setOrders(data.data);
        } else {
          console.error("Error fetching orders:", data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);


  // Function to get the color for a status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "U pripremi":
        return "orange";
      case "Poslata":
        return "blue";
      case "Dostavljena":
        return "green";
      case "Otkazana":
        return "red";
      default:
        return "black";
    }
  };
  const customRenderers = {
    orderTime: (order: any) => {
      const date = new Date(order.orderTime);
      return <span>{isNaN(date.getTime()) ? '-' : date.toLocaleString()}</span>;
    },
    total: (order: any) => (
      <span style={{ color: getStatusColor(order.total) }}>{order.total.toFixed(2)} RSD</span>
    ),
    status: (order: any) => (
      <span style={{ color: getStatusColor(order.status) }}>{order.status}</span>
    )
  };
  return (
    <>
      <div className="page-title">
        <h1>Upravljanje Porudžbinama</h1>
      </div>
      <div className={styles.manageCategoriesPage}>
        <div className={styles.manageOrdersPage}>
          <TableComponent
            data={orders}
            columns={["ID", "Vreme", "Korisnik", "Email", "Telefon", "Total", "Status"]} // Pass column names here
            columnKeys={["_id", "orderTime", "user", "userEmail", "userPhone", "total", "status"]} // Pass column names here
            customRenderers={customRenderers}
            onRowClick={(category) => router.push(`/admin/manage-orders/${category._id}`)}
            selectedRow={""}
            onRemove={undefined}
          />
        </div>
      </div>
    </>
  );
}