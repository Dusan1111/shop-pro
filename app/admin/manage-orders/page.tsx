"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery
      });

      const response = await fetch(`api/orders?${params}`, { method: "GET" });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.data);
        setTotalCount(data.totalCount);
      } else {
        console.error("Error fetching orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  // Function to get the styling for a status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "U pripremi":
        return { backgroundColor: '#fff3cd', color: '#856404' };
      case "Poslata":
        return { backgroundColor: '#cfe2ff', color: '#084298' };
      case "Dostavljena":
        return { backgroundColor: '#d4edda', color: '#155724' };
      case "Otkazana":
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return { backgroundColor: '#e2e3e5', color: '#383d41' };
    }
  };

  const customRenderers = {
    orderTime: (order: any) => {
      const date = new Date(order.orderTime);
      return <span>{isNaN(date.getTime()) ? '-' : date.toLocaleString()}</span>;
    },
    total: (order: any) => (
      <span>{order.total.toFixed(2)} RSD</span>
    ),
    status: (order: any) => (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        ...getStatusStyle(order.status)
      }}>
        {order.status}
      </span>
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
            columns={["ID", "Vreme", "Korisnik", "Email", "Telefon", "Total", "Status"]}
            columnKeys={["_id", "orderTime", "user", "userEmail", "userPhone", "total", "status"]}
            customRenderers={customRenderers}
            onRowClick={(category) => router.push(`/admin/manage-orders/${category._id}`)}
            selectedRow={""}
            onRemove={undefined}
            useBackendPagination={true}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(0);
            }}
            onSearchChange={(search) => {
              setSearchQuery(search);
              setCurrentPage(0);
            }}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
}