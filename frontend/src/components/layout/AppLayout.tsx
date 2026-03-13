import { Outlet, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { Bell, Menu, Moon, Search, Sun, Settings, LogOut, ChevronDown, DollarSign, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService, ApiPayment } from "@/services/api.service";
import { format } from "date-fns";

interface Notification {
  id: string;
  message: string;
  amount: number;
  date: string;
  invoiceNumber?: string;
  read: boolean;
}

const AppLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Notifications state — stored in memory (reset on page reload; intentional)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  // Track the latest payment id we've seen to detect new ones
  const latestPaymentIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  // Poll payments every 30 seconds
  const { data: payments } = useQuery<ApiPayment[]>({
    queryKey: ["payments-poll"],
    queryFn: () => apiService.getAllPayments(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  // Detect new payments on each poll
  useEffect(() => {
    if (!payments || payments.length === 0) return;

    // Sort by paymentDate DESC - newest first
    const sorted = [...payments].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
    const newestId = sorted[0].id;

    if (!initializedRef.current) {
      // First load — just record latest seen, don't generate notifications
      latestPaymentIdRef.current = newestId;
      initializedRef.current = true;
      return;
    }

    if (newestId === latestPaymentIdRef.current) return; // no new payments

    // Find all payments newer than the one we last saw
    const lastSeenIndex = sorted.findIndex((p) => p.id === latestPaymentIdRef.current);
    const newPayments = lastSeenIndex === -1 ? sorted : sorted.slice(0, lastSeenIndex);

    if (newPayments.length === 0) return;

    const newNotifs: Notification[] = newPayments.map((p) => ({
      id: p.id,
      message: `Payment received from ${p.invoice?.customer?.name || "a customer"}`,
      amount: p.amount,
      date: p.paymentDate,
      invoiceNumber: p.invoice?.invoiceNumber,
      read: false,
    }));

    setNotifications((prev) => [...newNotifs, ...prev].slice(0, 20)); // keep max 20
    setUnread((prev) => prev + newNotifs.length);

    // Invalidate dashboard + payments lists so they refresh
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });

    latestPaymentIdRef.current = newestId;
  }, [payments, queryClient]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed((c) => !c);
    } else {
      setIsSidebarOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const openNotifications = () => {
    setNotifOpen((o) => !o);
    setProfileOpen(false);
    // Mark all as read when opening
    if (!notifOpen) {
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnread(0);
  };

  // Build initials from name
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

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
            <div ref={notifRef} className="relative">
              <button
                onClick={openNotifications}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed sm:h-10 sm:w-10"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground animate-bounce">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">No new notifications</p>
                      <p className="text-[11px] text-muted-foreground/60">
                        You'll be notified when payments arrive
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-80 divide-y divide-border/50 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                            !n.read ? "bg-accent/5" : ""
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-success/10">
                            <DollarSign className="h-4 w-4 text-success" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground leading-snug">
                              {n.message}
                            </p>
                            {n.invoiceNumber && (
                              <p className="text-[11px] text-accent font-medium mt-0.5">
                                {n.invoiceNumber}
                              </p>
                            )}
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">
                                {format(new Date(n.date), "MMM dd, hh:mm a")}
                              </span>
                              <span className="text-xs font-bold text-success">
                                +${n.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-card px-2 py-1.5 shadow-clay-sm hover:shadow-clay transition-all sm:gap-3 sm:px-3 sm:py-2"
                aria-label="User menu"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-[10px] font-semibold text-primary-foreground shadow-clay-sm sm:h-8 sm:w-8 sm:text-xs">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-foreground leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                    {user?.email || ""}
                  </p>
                </div>
                <ChevronDown
                  className={`hidden h-3.5 w-3.5 text-muted-foreground transition-transform sm:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-card shadow-xl">
                  {/* User info header */}
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
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
