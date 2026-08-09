'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AdminSidebar, MobileMenuButton } from '@/components/admin/admin-sidebar';
import { useAdminStore } from '@/stores/admin';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarOpen = useAdminStore((s) => s.sidebarOpen);
  const isMobile = useIsMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen bg-background text-foreground">
          {/* Desktop Sidebar */}
          <AdminSidebar />

          {/* Main Content Area - offset by sidebar on desktop */}
          <div
            className={cn(
              'transition-[margin] duration-300 min-h-screen flex flex-col',
              !isMobile && (sidebarOpen ? 'ml-64' : 'ml-16'),
            )}
          >
            {/* Sticky Header Bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-sm px-4">
              <MobileMenuButton />
              <div className="flex-1" />
              <a
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent/50"
              >
                ← Casino
              </a>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-4 md:p-6">
              {children}
            </main>
          </div>

          <Toaster position="bottom-right" richColors />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
