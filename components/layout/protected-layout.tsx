"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/auth";
import { ROUTES } from "@/lib/constants";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      const timeoutId = setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, loading, mounted, router]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

