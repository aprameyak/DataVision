"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export const useDeleteFileOnExit = (id: string | null) => {
  const router = useRouter();
  const pathname = usePathname();
  const hasDeleted = useRef(false);
  const initialPath = useRef(pathname);

  const deleteFile = () => {
    if (!id || hasDeleted.current) return;
    const url = "/api/delete_file";
    const data = JSON.stringify({ id });
    const blob = new Blob([data], { type: "application/json" });
    navigator.sendBeacon(url, blob);
    hasDeleted.current = true;
  };

  useEffect(() => {
    // Handles tab close or refresh
    const handlePageHide = () => deleteFile();
    const handleBeforeUnload = () => deleteFile();

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id]);

  useEffect(() => {
    if (hasDeleted.current) return;

    // Route change detected (back, forward, link clicks)
    if (pathname !== initialPath.current) {
      deleteFile();
    }
  }, [pathname]);
};