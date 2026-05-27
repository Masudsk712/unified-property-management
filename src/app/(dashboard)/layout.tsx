"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";
import { useUIStore } from "@/store";
import { useAllRealtime } from "@/hooks/useRealtime";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed, mobileSidebarOpen } = useUIStore();
  const [isDesktop, setIsDesktop] = useState(false);

  // Activate all real-time streams
  useAllRealtime();

  // Detect desktop for sidebar margin logic (avoids hydration mismatch)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const sidebarWidth = isDesktop ? (sidebarCollapsed ? 72 : 280) : 0;

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <Sidebar />
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 w-full min-w-0"
      >
        <Navbar />
        <div className="p-4 sm:p-6 lg:p-6 xl:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </motion.main>
    </div>
  );
}