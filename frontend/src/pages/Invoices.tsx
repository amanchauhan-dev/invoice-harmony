import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- Types ---

interface Invoice {
  id: string;
  customer: string;
  amount: string;
  status: "Paid" | "Sent" | "Overdue" | "Draft";
  date: string;
  due: string;
}

// --- Seed Data ---

const seedInvoices: Invoice[] = [
  {
    id: "INV-001",
    customer: "Acme Corp",
    amount: "$2,500.00",
    status: "Paid",
    date: "Mar 12, 2026",
    due: "Mar 26, 2026",
  },
  {
    id: "INV-002",
    customer: "TechStart Inc",
    amount: "$1,800.00",
    status: "Sent",
    date: "Mar 11, 2026",
    due: "Mar 25, 2026",
  },
  {
    id: "INV-003",
    customer: "Design Studio",
    amount: "$3,200.00",
    status: "Overdue",
    date: "Mar 05, 2026",
    due: "Mar 19, 2026",
  },
  {
    id: "INV-004",
    customer: "Cloud Nine LLC",
    amount: "$950.00",
    status: "Draft",
    date: "Mar 13, 2026",
    due: "Mar 27, 2026",
  },
  {
    id: "INV-005",
    customer: "GreenLeaf Co",
    amount: "$4,100.00",
    status: "Paid",
    date: "Mar 10, 2026",
    due: "Mar 24, 2026",
  },
  {
    id: "INV-006",
    customer: "Acme Corp",
    amount: "$1,250.00",
    status: "Sent",
    date: "Mar 08, 2026",
    due: "Mar 22, 2026",
  },
];

const statusConfig = {
  Paid: {
    label: "Paid",
    icon: CheckCircle2,
    class: "bg-success/15 text-success",
  },
  Sent: { label: "Sent", icon: Clock, class: "bg-accent/15 text-accent" },
  Overdue: {
    label: "Overdue",
    icon: AlertCircle,
    class: "bg-destructive/15 text-destructive",
  },
  Draft: {
    label: "Draft",
    icon: FileText,
    class: "bg-muted text-muted-foreground",
  },
};

const formatCurrency = (amount: string) => amount;

// --- Component ---

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");

  const [deleteConfirm, setDeleteConfirm] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || inv.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [invoices, search, filter]);

  const handleDelete = () => {
    if (deleteConfirm) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Invoices</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Manage and track your billing operations.</p>
        </div>
        <button 
          onClick={() => navigate("/invoices/create")}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground shadow-clay transition-all hover:opacity-90 active:scale-95 sm:px-5 sm:py-3"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-card shadow-clay"
      >
        {/* Filters & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center px-6 py-5 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              className="h-10 w-full rounded-xl bg-card pl-10 pr-4 text-sm text-foreground shadow-clay-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Paid", "Sent", "Overdue", "Draft"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-clay-sm"
                    : "bg-background text-muted-foreground hover:shadow-clay"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Card List (hidden on md+) */}
        <div className="divide-y divide-border/50 md:hidden">
          {filteredInvoices.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No invoices found.</p>
          ) : (
            filteredInvoices.map((inv) => {
              const cfg = statusConfig[inv.status];
              const Icon = cfg.icon;
              return (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-accent">{inv.id}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.class}`}>
                        <Icon className="h-2.5 w-2.5" />
                        {inv.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">{inv.customer}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{inv.date}</span>
                      <span className="font-semibold text-foreground">{inv.amount}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl bg-card border-border shadow-clay">
                      <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5" onSelect={() => navigate(`/invoices/view/${inv.id}`)}>
                        <Eye className="h-4 w-4 text-accent" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5" onSelect={() => navigate(`/invoices/edit/${inv.id}`)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" /> Edit Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5">
                        <FileDown className="h-4 w-4 text-muted-foreground" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => setDeleteConfirm(inv)}>
                        <Trash2 className="h-4 w-4" /> Delete Permanent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop table (hidden on mobile) */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredInvoices.map((inv, i) => {
                  const config = statusConfig[inv.status];
                  return (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.05 }}
                      className="group border-t border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-accent">{inv.id}</td>
                      <td className="px-6 py-4 text-foreground font-medium">{inv.customer}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{inv.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusConfig[inv.status].class}`}>
                          {(() => { const Icon = statusConfig[inv.status].icon; return <Icon className="h-3 w-3" />; })()}
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{inv.date}</td>
                      <td className="px-6 py-4 text-muted-foreground">{inv.due}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 shadow-clay-sm hover:shadow-clay transition-all">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl bg-card border-border shadow-clay">
                            <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5" onSelect={() => navigate(`/invoices/view/${inv.id}`)}>
                              <Eye className="h-4 w-4 text-accent" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5" onSelect={() => navigate(`/invoices/edit/${inv.id}`)}>
                              <Pencil className="h-4 w-4 text-muted-foreground" /> Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5">
                              <FileDown className="h-4 w-4 text-muted-foreground" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={() => setDeleteConfirm(inv)}>
                              <Trash2 className="h-4 w-4" /> Delete Permanent
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* --- Delete Confirmation --- */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(o) => !o && setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl bg-card border-border shadow-xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl font-bold">
                Delete Invoice?
              </DialogTitle>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">
                  {deleteConfirm?.id}
                </span>{" "}
                for{" "}
                <span className="font-bold text-foreground">
                  {deleteConfirm?.customer}
                </span>
                ? This action is permanent.
              </p>
            </div>
            <div className="flex w-full gap-3 mt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl bg-background py-3 text-sm font-bold text-foreground shadow-clay-sm hover:shadow-clay"
              >
                No, Keep it
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-bold text-white shadow-clay-sm hover:brightness-110 active:scale-95 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
