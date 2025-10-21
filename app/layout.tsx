import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.scss";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/components/AuthProvider";
import { SidebarProvider } from "@/components/SidebarContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TransitionProvider from "@/components/TransitionProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shop PRO",
  description: "Shop PRO - Your Ultimate E-commerce Admin Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" sizes="any" style={{borderRadius:"50%"}} />
        <meta name="theme-color" content="#4f687b" />
      </head>
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          <SidebarProvider>
            <Navbar />
            <Sidebar />
            <div className="main-content">
              {children}
            </div>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <TransitionProvider />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}