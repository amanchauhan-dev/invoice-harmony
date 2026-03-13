import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiService, ApiDashboardOverview } from "../services/api.service";
import { useAuth } from "../context/AuthContext";

const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiService.getDashboardOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-destructive/10 p-6 text-center text-destructive">
        Failed to load dashboard data.
      </div>
    );
  }

  const overview = data.overview;
  const recentInvoices = data.recentInvoices;

  const stats = [
    { label: "Total Revenue", value: formatCurrency(overview.totalRevenue, overview.currency), change: "+12.5%", up: true, icon: DollarSign, color: "bg-accent/10 text-accent" },
    { label: "Total Invoices", value: overview.totalInvoices.toString(), change: "+8.2%", up: true, icon: FileText, color: "bg-success/10 text-success" },
    { label: "Pending Payments", value: formatCurrency(overview.pendingPayments, overview.currency), change: "-3.1%", up: false, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Active Customers", value: overview.activeCustomers.toString(), change: "+5.7%", up: true, icon: Users, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">Dashboard</h1>
        <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">Welcome back, {user?.name}. Here's your financial overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="rounded-2xl bg-card p-5 shadow-clay transition-shadow hover:shadow-clay-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.color} shadow-clay-sm`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-heading text-2xl font-bold text-foreground">{stat.value}</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
              {stat.up ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className={stat.up ? "text-success" : "text-destructive"}>{stat.change}</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Invoices & Revenue */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="col-span-2 rounded-2xl bg-card shadow-clay"
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <h2 className="font-heading text-sm font-semibold text-foreground sm:text-base">Recent Invoices</h2>
            <a href="/invoices" className="text-xs font-medium text-accent hover:underline">View all</a>
          </div>

          {/* Mobile invoice cards */}
          <div className="divide-y divide-border/50 md:hidden">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex flex-col gap-0.5 sm:gap-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-semibold text-foreground text-sm sm:text-base">{inv.invoiceNumber}</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${statusStyles[inv.status] || statusStyles.Draft}`}>{inv.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">{typeof inv.customer === 'object' && inv.customer ? inv.customer.name : 'Unknown'}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">•</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{format(new Date(inv.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(inv.totalAmount, overview.currency)}</p>
                  </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3">Invoice</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-foreground">{inv.invoiceNumber}</td>
                    <td className="px-6 py-3.5 text-foreground">{typeof inv.customer === 'object' && inv.customer ? inv.customer.name : 'Unknown'}</td>
                    <td className="px-6 py-3.5 font-medium text-foreground">{formatCurrency(inv.totalAmount, overview.currency)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[inv.status] || statusStyles.Draft}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{format(new Date(inv.createdAt), "MMM dd, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
          className="rounded-2xl bg-card shadow-clay"
        >
          <div className="px-6 py-4">
            <h2 className="font-heading text-base font-semibold text-foreground">Revenue Overview</h2>
          </div>
          <div className="space-y-5 p-6 pt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 shadow-clay-sm">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="font-heading text-lg font-bold text-foreground">$12,480.00</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Collected", value: "$9,230", pct: 74 },
                { label: "Pending", value: "$2,150", pct: 17 },
                { label: "Overdue", value: "$1,100", pct: 9 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-background shadow-clay-inset">
                    <div
                      className={`h-2 rounded-full ${
                        item.label === "Collected" ? "bg-success" : item.label === "Pending" ? "bg-warning" : "bg-destructive"
                      }`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const statusStyles: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Sent: "bg-accent/10 text-accent",
  Overdue: "bg-destructive/10 text-destructive",
  Draft: "bg-muted text-muted-foreground",
};

export default Dashboard;
