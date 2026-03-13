import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Receipt,
  X,
} from "lucide-react";

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/invoices", icon: FileText, label: "Invoices" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const AppSidebar = ({ isOpen, onClose, isCollapsed }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh flex-col bg-sidebar transition-all duration-300 lg:translate-x-0 ${
          isCollapsed ? "w-[68px]" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo row */}
        <div
          className={`flex h-14 shrink-0 items-center border-b border-sidebar-border sm:h-16 ${
            isCollapsed ? "justify-center px-0" : "justify-between px-5"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg shadow-sidebar-primary/20 sm:h-9 sm:w-9">
              <Receipt className="h-4 w-4 text-sidebar-primary-foreground sm:h-5 sm:w-5" />
            </div>
            {!isCollapsed && (
              <span className="animate-in fade-in slide-in-from-left-2 whitespace-nowrap font-heading text-base font-bold text-sidebar-primary-foreground duration-200 sm:text-lg">
                InvoicePro
              </span>
            )}
          </div>

          {/* Close button – mobile only */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 px-2.5 py-4">
          {navItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isCollapsed ? "justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-sidebar-primary/10"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 transition-transform ${
                    isCollapsed ? "" : "group-hover:scale-110"
                  }`}
                />
                {!isCollapsed && (
                  <span className="animate-in fade-in slide-in-from-left-2 whitespace-nowrap duration-200">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-sidebar-border p-2.5">
          <NavLink
            to="/auth"
            title={isCollapsed ? "Log Out" : undefined}
            className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && (
              <span className="animate-in fade-in slide-in-from-left-2 whitespace-nowrap duration-200">
                Log Out
              </span>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
