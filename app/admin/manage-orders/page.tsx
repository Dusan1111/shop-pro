"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./manage-orders.module.scss";
import TableComponent from "../shared/smart-table";
import { useRouter } from "next/navigation";

type OrderStatus = "U pripremi" | "Poslata" | "Otkazana";

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
  const [activeTab, setActiveTab] = useState<OrderStatus>("U pripremi");
  const [isInitialized, setIsInitialized] = useState(false);
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus, number>>({
    "U pripremi": 0,
    "Poslata": 0,
    "Otkazana": 0
  });
  const router = useRouter();

  // Load saved tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('ordersActiveTab');
    if (savedTab && (savedTab === "U pripremi" || savedTab === "Poslata" || savedTab === "Otkazana")) {
      setActiveTab(savedTab as OrderStatus);
    }
    setIsInitialized(true);
  }, []);

  const fetchStatusCount = useCallback(async (status: OrderStatus) => {
    try {
      const params = new URLSearchParams({
        page: "0",
        pageSize: "1",
        search: "",
        status: status
      });
      const response = await fetch(`api/orders?${params}`, { method: "GET" });
      const data = await response.json();
      if (response.ok) {
        setStatusCounts(prev => ({
          ...prev,
          [status]: data.totalCount
        }));
      }
    } catch (error) {
      console.error("Error fetching status count:", error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        search: searchQuery,
        status: activeTab
      });

      const response = await fetch(`api/orders?${params}`, { method: "GET" });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.data);
        setTotalCount(data.totalCount);
        // Update the count for the current active tab
        setStatusCounts(prev => ({
          ...prev,
          [activeTab]: data.totalCount
        }));
      } else {
        console.error("Error fetching orders:", data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, activeTab]);

  useEffect(() => {
    if (isInitialized) {
      fetchOrders();
    }
  }, [fetchOrders, isInitialized]);


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
  const handleTabChange = (status: OrderStatus) => {
    setActiveTab(status);
    setCurrentPage(0);
    setSearchQuery("");
    localStorage.setItem('ordersActiveTab', status);
  };

  return (
    <>
      <div className="page-title">
        <h1>Upravljanje Porudžbinama</h1>
      </div>
      <div className={styles.manageCategoriesPage}>
        <div className={styles.manageOrdersPage}>
          <div className={styles.tabCard}>
            <div className={styles.tabsContainer}>
              <button
                className={`${styles.tab} ${activeTab === "U pripremi" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("U pripremi")}
              >
                Primljene
                {statusCounts["U pripremi"] > 0 && (
                  <span className={styles.countBadge}>{statusCounts["U pripremi"]}</span>
                )}
              </button>
              <button
                className={`${styles.tab} ${activeTab === "Poslata" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("Poslata")}
              >
                Poslate
              </button>
              <button
                className={`${styles.tab} ${activeTab === "Otkazana" ? styles.activeTab : ""}`}
                onClick={() => handleTabChange("Otkazana")}
              >
                Otkazane
              </button>
            </div>

            <div className={styles.tabContent}>
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
        </div>
      </div>
    </>
  );
}