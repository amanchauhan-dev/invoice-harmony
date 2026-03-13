import { motion } from "framer-motion";
import { Search } from "lucide-react";

const payments = [
  { id: 1, invoice: "INV-001", customer: "Acme Corp", amount: "$2,500.00", method: "Bank Transfer", date: "Mar 12, 2026", ref: "TXN-8834" },
  { id: 2, invoice: "INV-005", customer: "GreenLeaf Co", amount: "$4,100.00", method: "Card", date: "Mar 10, 2026", ref: "TXN-8821" },
  { id: 3, invoice: "INV-006", customer: "Acme Corp", amount: "$1,250.00", method: "UPI", date: "Mar 09, 2026", ref: "TXN-8815" },
];

const methodStyles: Record<string, string> = {
  "Bank Transfer": "bg-accent/10 text-accent",
  Card: "bg-success/10 text-success",
  UPI: "bg-warning/10 text-warning",
  Cash: "bg-muted text-muted-foreground",
};

const Payments = () => {
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
              className="h-10 w-full rounded-xl bg-background pl-10 pr-4 text-sm shadow-clay-inset placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
            />
          </div>
        </div>

        {/* Mobile card list */}
        <div className="divide-y divide-border/50 md:hidden">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-accent">{p.invoice}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${methodStyles[p.method]}`}>
                    {p.method}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">{p.customer}</p>
                <p className="text-[11px] text-muted-foreground">{p.date} · {p.ref}</p>
              </div>
              <p className="shrink-0 font-bold text-foreground">{p.amount}</p>
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
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-accent">{p.invoice}</td>
                  <td className="px-6 py-4 text-foreground">{p.customer}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{p.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${methodStyles[p.method]}`}>
                      {p.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{p.date}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Payments;
