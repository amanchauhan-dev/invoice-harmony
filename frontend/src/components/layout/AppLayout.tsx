import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const AppLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed((c) => !c);
    } else {
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main content column */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/95 px-3 backdrop-blur-md sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {/* Universal sidebar toggle */}
            <button
              onClick={handleMenuToggle}
              aria-label="Toggle sidebar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-clay-sm transition-all hover:bg-muted hover:text-foreground active:shadow-clay-pressed sm:h-10 sm:w-10"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Search bar */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-44 rounded-xl bg-card pl-10 pr-4 text-sm text-foreground shadow-clay-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0 md:w-72"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-clay-sm transition-all hover:shadow-clay hover:text-foreground active:shadow-clay-pressed sm:h-10 sm:w-10"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2 rounded-xl bg-card px-2 py-1.5 shadow-clay-sm sm:gap-3 sm:px-3 sm:py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-[10px] font-semibold text-primary-foreground shadow-clay-sm sm:h-8 sm:w-8 sm:text-xs">
                JP
              </div>
              <div className="hidden text-sm sm:block">
                <p className="font-medium text-foreground leading-none">John Pro</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
