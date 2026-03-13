import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService, ApiPayment } from "../services/api.service";
import { format } from "date-fns";

const methodStyles: Record<string, string> = {
  "Bank Transfer": "bg-accent/10 text-accent",
  Card: "bg-success/10 text-success",
  UPI: "bg-warning/10 text-warning",
  Cash: "bg-muted text-muted-foreground",
};

const Payments = () => {
  const [search, setSearch] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => apiService.getAllPayments(),
  });

  const filteredPayments = payments.filter((p: ApiPayment) => 
     p.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
     p.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">Payments</h1>
        <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">Track all received payments and transaction history.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl bg-card shadow-clay"
      >
        {/* Search bar */}
        <div className="border-b border-border/50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search payments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl bg-background pl-10 pr-4 text-sm shadow-clay-inset placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse">
            {/* Mobile skeleton */}
            <div className="divide-y divide-border/50 md:hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-28 rounded bg-muted" />
                    <div className="h-3 w-36 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                  <div className="h-4 w-16 rounded bg-muted" />
                </div>
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    {[...Array(6)].map((_, i) => (
                      <th key={i} className="px-6 py-3"><div className="h-3 w-16 rounded bg-muted" /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-3.5 w-20 rounded bg-muted" /></td>
                      <td className="px-6 py-4"><div className="h-3.5 w-28 rounded bg-muted" /></td>
                      <td className="px-6 py-4"><div className="h-3.5 w-16 rounded bg-muted" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-muted" /></td>
                      <td className="px-6 py-4"><div className="h-3.5 w-24 rounded bg-muted" /></td>
                      <td className="px-6 py-4"><div className="h-3.5 w-20 rounded bg-muted" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>

        {/* Mobile card list */}
        <div className="divide-y divide-border/50 md:hidden">
          {filteredPayments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-accent">{p.invoice?.invoiceNumber}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${methodStyles[p.paymentMethod] || methodStyles.Cash}`}>
                    {p.paymentMethod}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">{p.invoice?.customer?.name}</p>
                <p className="text-[11px] text-muted-foreground">{format(new Date(p.paymentDate), "MMM dd, yyyy")} · {p.id.slice(-6).toUpperCase()}</p>
              </div>
              <p className="shrink-0 font-bold text-foreground">${p.amount.toLocaleString()}</p>
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
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-accent">{p.invoice?.invoiceNumber}</td>
                  <td className="px-6 py-4 text-foreground">{p.invoice?.customer?.name}</td>
                  <td className="px-6 py-4 font-medium text-foreground">${p.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${methodStyles[p.paymentMethod] || methodStyles.Cash}`}>
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{format(new Date(p.paymentDate), "MMM dd, yyyy")}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.id.slice(-6).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
      )}
      </motion.div>
    </div>
  );
};

export default Payments;
