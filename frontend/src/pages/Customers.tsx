import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  CalendarDays,
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, ApiCustomer } from "../services/api.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Customer = ApiCustomer & { 
  status: "active" | "inactive";
  invoices: number;
  revenue: string;
  joinedDate: string;
};

// ─── Seed data removed ────────────────────────────────────────────────────────────────

// ─── Shared form field ────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <input
          {...props}
          className={`h-10 w-full rounded-xl bg-background text-sm text-foreground shadow-clay-inset placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0 ${
            Icon ? "pl-9 pr-4" : "px-4"
          } ${props.className ?? ""}`}
        />
      </div>
    </div>
  );
}

// ─── Avatar helper ────────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base" };
  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary font-heading font-bold text-white shadow-clay-sm`}
    >
      {initials}
    </div>
  );
}

// ─── Stat card (used in View dialog) ─────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background p-3 shadow-clay-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ─── Empty form ───────────────────────────────────────────────────────────────

function emptyForm(): Partial<Customer> {
  return {
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Customers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: rawCustomers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiService.getCustomers(),
  });

  const customers: Customer[] = useMemo(() => {
    return rawCustomers.map(c => ({
      ...c,
      status: "active", // We don't have this in db yet, assume active
      company: c.company || "N/A",
      phone: c.phone || "N/A",
      address: c.address || "N/A",
      invoices: c._count?.invoices || 0,
      revenue: "$0", // Mock for now until we add revenue aggregations per customer
      joinedDate: new Date(c.createdAt).toLocaleDateString(),
    }));
  }, [rawCustomers]);

  // dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

  // form state (shared for create + edit)
  const [form, setForm] = useState<Partial<Customer>>(emptyForm());

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.company?.toLowerCase().includes(search.toLowerCase())
      ),
    [customers, search]
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newCustomer: any) => apiService.createCustomer(newCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCreateOpen(false);
      toast.success('Customer created successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to create customer')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => apiService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditCustomer(null);
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update customer')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteCustomer(null);
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to delete customer')
  });

  // ── handlers ──────────────────────────────────────────────────────────────

  function openCreate() {
    setForm(emptyForm());
    setCreateOpen(true);
  }

  function openEdit(c: Customer) {
    const { id: _id, ...rest } = c;
    setForm(rest);
    setEditCustomer(c);
  }

  function handleSaveCreate() {
    if (!form.name?.trim() || !form.email?.trim()) return;
    createMutation.mutate({
      name: form.name,
      email: form.email,
      company: form.company,
      phone: form.phone,
      address: form.address
    });
  }

  function handleSaveEdit() {
    if (!editCustomer || !form.name?.trim() || !form.email?.trim()) return;
    updateMutation.mutate({
      id: editCustomer.id,
      data: {
        name: form.name,
        email: form.email,
        company: form.company,
        phone: form.phone,
        address: form.address
      }
    });
  }

  function handleDelete() {
    if (!deleteCustomer) return;
    deleteMutation.mutate(deleteCustomer.id);
  }

  function handleFormChange(field: keyof Customer, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── shared form body ───────────────────────────────────────────────────────

  const CustomerForm = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="Full Name *"
        icon={User}
        placeholder="e.g. Acme Corp"
        value={form.name || ""}
        onChange={(e) => handleFormChange("name", e.target.value)}
      />
      <Field
        label="Email *"
        icon={Mail}
        type="email"
        placeholder="billing@company.com"
        value={form.email || ""}
        onChange={(e) => handleFormChange("email", e.target.value)}
      />
      <Field
        label="Company"
        icon={Building2}
        placeholder="Company name"
        value={form.company || ""}
        onChange={(e) => handleFormChange("company", e.target.value)}
      />
      <Field
        label="Phone"
        icon={Phone}
        type="tel"
        placeholder="+1 (555) 000-0000"
        value={form.phone || ""}
        onChange={(e) => handleFormChange("phone", e.target.value)}
      />
      <div className="sm:col-span-2">
        <Field
          label="Address"
          icon={MapPin}
          placeholder="Street, City, State ZIP"
          value={form.address || ""}
          onChange={(e) => handleFormChange("address", e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Status
        </label>
        <div className="flex gap-3">
          {(["active", "inactive"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleFormChange("status", s)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all ${
                form.status === s
                  ? s === "active"
                    ? "bg-success/15 text-success ring-1 ring-success/30"
                    : "bg-destructive/15 text-destructive ring-1 ring-destructive/30"
                  : "bg-background shadow-clay-sm text-muted-foreground hover:shadow-clay"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">Customers</h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
            {customers.length} customer{customers.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Add Customer</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl bg-card shadow-clay"
      >
        {/* Search */}
        <div className="px-6 py-4 border-b border-border/50">
          <div className="relative w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="h-10 w-full rounded-xl bg-background pl-10 pr-4 text-sm shadow-clay-inset placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
            />
          </div>
        </div>

        {/* Mobile card list (hidden on md+) */}
        <div className="divide-y divide-border/50 md:hidden">
          {filtered.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No customers found.</p>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground text-sm">{c.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-foreground">{c.revenue}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        c.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl">
                    <DropdownMenuItem className="gap-2.5 rounded-lg cursor-pointer" onSelect={() => setViewCustomer(c)}>
                      <Eye className="h-4 w-4 text-accent" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2.5 rounded-lg cursor-pointer" onSelect={() => openEdit(c)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" /> Edit Customer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => setDeleteCustomer(c)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>

        {/* Desktop table (hidden on mobile) */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Invoices</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="border-t border-border/50 hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} size="sm" />
                          <div>
                            <p className="font-medium text-foreground">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{c.company}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.phone}</td>
                      <td className="px-6 py-4 text-foreground">{c.invoices}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{c.revenue}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            c.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 shadow-clay-sm hover:shadow-clay transition-all">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl">
                            <DropdownMenuItem className="gap-2.5 rounded-lg cursor-pointer" onSelect={() => setViewCustomer(c)}>
                              <Eye className="h-4 w-4 text-accent" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2.5 rounded-lg cursor-pointer" onSelect={() => openEdit(c)}>
                              <Pencil className="h-4 w-4 text-muted-foreground" /> Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => setDeleteCustomer(c)}>
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>


      {/* ── Create Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-card border-border shadow-clay">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <User className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg text-foreground">Add Customer</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Fill in the details below to create a new customer record.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <CustomerForm />
          <DialogFooter className="gap-2 pt-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium text-foreground shadow-clay-sm transition-all hover:shadow-clay"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCreate}
              disabled={!form.name?.trim() || !form.email?.trim() || createMutation.isPending}
              className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-accent-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? "Creating..." : "Create Customer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={!!viewCustomer} onOpenChange={(o) => !o && setViewCustomer(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-card border-border shadow-clay">
          <DialogHeader>
            <DialogTitle className="sr-only">Customer Details</DialogTitle>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-5">
              {/* Hero */}
              <div className="flex items-center gap-4 rounded-xl bg-background p-4 shadow-clay-sm">
                <Avatar name={viewCustomer.name} size="lg" />
                <div>
                  <p className="font-heading text-lg font-bold text-foreground">{viewCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">{viewCustomer.email}</p>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      viewCustomer.status === "active"
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {viewCustomer.status}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={FileText} label="Total Invoices" value={viewCustomer.invoices} />
                <StatCard icon={DollarSign} label="Total Revenue" value={viewCustomer.revenue} />
              </div>

              {/* Info rows */}
              <div className="space-y-2.5">
                {[
                  { icon: Building2, label: "Company", value: viewCustomer.company },
                  { icon: Phone, label: "Phone", value: viewCustomer.phone },
                  { icon: MapPin, label: "Address", value: viewCustomer.address },
                  { icon: CalendarDays, label: "Joined", value: viewCustomer.joinedDate },
                ].map(({ icon: Icon, label, value }) =>
                  value ? (
                    <div key={label} className="flex items-start gap-3 text-sm">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-foreground">{value}</p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setViewCustomer(null);
                    openEdit(viewCustomer);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-background py-2.5 text-sm font-medium text-foreground shadow-clay-sm transition-all hover:shadow-clay"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setViewCustomer(null);
                    setDeleteCustomer(viewCustomer);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)}>
        <DialogContent className="max-w-lg rounded-2xl bg-card border-border shadow-clay">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg text-foreground">Edit Customer</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Update the customer's information below.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <CustomerForm />
          <DialogFooter className="gap-2 pt-2">
            <button
              onClick={() => setEditCustomer(null)}
              className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium text-foreground shadow-clay-sm transition-all hover:shadow-clay"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!form.name?.trim() || !form.email?.trim() || updateMutation.isPending}
              className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-medium text-accent-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!deleteCustomer} onOpenChange={(o) => !o && setDeleteCustomer(null)}>
        <DialogContent className="max-w-sm rounded-2xl bg-card border-border shadow-clay text-center">
          <DialogHeader>
            <DialogTitle className="sr-only">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="font-heading text-base font-bold text-foreground">Delete Customer?</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{deleteCustomer?.name}</span> will be
                permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="flex w-full gap-3">
              <button
                onClick={() => setDeleteCustomer(null)}
                className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium text-foreground shadow-clay-sm transition-all hover:shadow-clay"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 active:opacity-80 disabled:opacity-50"
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

export default Customers;
