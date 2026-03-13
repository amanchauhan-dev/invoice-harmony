import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
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
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, ApiInvoice } from "../services/api.service";
import { toast } from "sonner";
import { format } from "date-fns";

interface StatusConfigItem {
  label: string;
  icon: React.ElementType;
  class: string;
}

const statusConfig: Record<string, StatusConfigItem> = {
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const Invoices = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [deleteConfirm, setDeleteConfirm] = useState<ApiInvoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiService.getInvoices(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setDeleteConfirm(null);
      toast.success("Invoice removed");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete invoice");
    }
  });


  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || inv.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [invoices, search, filter]);

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-xl bg-muted" />
            <div className="h-4 w-52 rounded-lg bg-muted" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-muted" />
        </div>
        {/* Filters skeleton */}
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-8 w-20 rounded-xl bg-muted" />)}
        </div>
        {/* Card list skeleton */}
        <div className="rounded-2xl bg-card shadow-clay-sm overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border/30">
              <div className="h-9 w-9 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 rounded bg-muted" />
                <div className="h-3 w-28 rounded bg-muted" />
              </div>
              <div className="hidden sm:block h-3.5 w-20 rounded bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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

        {/* Mobile List */}
        <div className="divide-y divide-border/50 md:hidden">
          {filteredInvoices.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No invoices found.</p>
          ) : (
            filteredInvoices.map((inv) => {
              const cfg = statusConfig[inv.status] || statusConfig.Draft;
              const Icon = cfg.icon;
              return (
                <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-accent">{inv.invoiceNumber}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.class}`}>
                        <Icon className="h-2.5 w-2.5" />
                        {inv.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">{inv.customerName}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{format(new Date(inv.issueDate), "MMM dd, yyyy")}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(inv.totalAmount)}</span>
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
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5 text-destructive" onSelect={() => setDeleteConfirm(inv)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table */}
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
              <AnimatePresence initial={false}>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, i) => {
                    const cfg = statusConfig[inv.status] || statusConfig.Draft;
                    const Icon = cfg.icon;
                    return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className="border-t border-border/50 transition-colors hover:bg-muted/30 group"
                      >
                        <td className="px-6 py-4 font-bold text-accent">{inv.invoiceNumber}</td>
                        <td className="px-6 py-4 font-medium text-foreground">{inv.customerName}</td>
                        <td className="px-6 py-4 font-semibold text-foreground">{formatCurrency(inv.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.class}`}>
                            <Icon className="h-3 w-3" />
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{format(new Date(inv.issueDate), "MMM dd, yyyy")}</td>
                        <td className="px-6 py-4 text-muted-foreground">{format(new Date(inv.dueDate), "MMM dd, yyyy")}</td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 shadow-clay-sm hover:shadow-clay transition-all">
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
                              <DropdownMenuSeparator className="bg-border/50" />
                              <DropdownMenuItem className="gap-2.5 rounded-xl cursor-pointer py-2.5 text-destructive" onSelect={() => setDeleteConfirm(inv)}>
                                <Trash2 className="h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-3xl bg-card border-border shadow-clay p-8 text-center">
          <DialogTitle className="sr-only">Confirm Delete</DialogTitle>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-foreground">Delete Invoice?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This will permanently remove invoice <span className="font-bold text-foreground">{deleteConfirm?.invoiceNumber}</span>. This action is irreversible.
              </p>
            </div>
            <div className="flex w-full gap-3 mt-4">
              <button
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl bg-background py-3 text-sm font-bold text-foreground shadow-clay-sm transition-all hover:shadow-clay"
              >
                Cancel
              </button>
              <button
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-bold text-white shadow-clay-sm transition-all hover:opacity-90 active:scale-95"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
