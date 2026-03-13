import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  User,
  Hash,
  Mail,
  MapPin,
  Building2,
  Settings2,
  Layout,
  Eye,
  Info,
} from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceForm {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  notes: string;
  status: "Draft" | "Sent" | "Paid";
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState<InvoiceForm>({
    invoiceNumber: id || `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }],
    notes: "",
    status: "Draft",
  });

  const subtotal = useMemo(() => {
    return form.items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  }, [form.items]);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 },
      ],
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (form.items.length === 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSave = () => {
    console.log("Saving invoice:", form);
    navigate("/invoices");
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        // Ignore zero-width hidden states to not squash the invoice completely
        if (w > 0) {
          // 800px is the fixed design width of the invoice paper.
          // 40px safe padding on sides.
          const newScale = Math.min(1, Math.max(0.2, (w - 40) / 800));
          setScale(newScale);
        }
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const renderFormContent = () => (
    <div className="h-full overflow-y-auto bg-card/50 p-4 sm:p-6 lg:border-r lg:border-border/50 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6 pb-32 sm:space-y-8">
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <Settings2 className="h-4 w-4" />
            <h2 className="text-xs font-black uppercase tracking-widest">General Info</h2>
          </div>
          
          <div className="space-y-4 rounded-3xl bg-background p-5 shadow-clay-inset">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Invoice Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className="w-full rounded-xl border-0 bg-card py-2 pl-9 pr-3 text-sm font-bold text-foreground shadow-clay-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Issue Date</label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  className="w-full rounded-xl border-0 bg-card px-3 py-2 text-xs font-bold text-foreground shadow-clay-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full rounded-xl border-0 bg-card px-3 py-2 text-xs font-bold text-foreground shadow-clay-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <User className="h-4 w-4" />
            <h2 className="text-xs font-black uppercase tracking-widest">Bill To</h2>
          </div>
          
          <div className="space-y-4 rounded-3xl bg-background p-5 shadow-clay-inset">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Customer Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full rounded-xl border-0 bg-card px-4 py-2 text-sm font-bold text-foreground shadow-clay-sm outline-none placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Email Address</label>
              <input
                type="email"
                placeholder="customer@company.com"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full rounded-xl border-0 bg-card px-4 py-2 text-sm font-bold text-foreground shadow-clay-sm outline-none placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Billing Address</label>
              <textarea
                placeholder="Street, City, ZIP..."
                value={form.customerAddress}
                onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                className="h-20 w-full resize-none rounded-xl border-0 bg-card px-4 py-2 text-sm font-bold text-foreground shadow-clay-sm outline-none placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent">
              <Layout className="h-4 w-4" />
              <h2 className="text-xs font-black uppercase tracking-widest">Line Items</h2>
            </div>
            <button
              onClick={handleAddItem}
              className="rounded-lg bg-accent/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-accent transition-all hover:bg-accent/20"
            >
              <Plus className="mr-1 inline h-3 w-3" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {form.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative rounded-3xl border border-transparent bg-background p-4 shadow-clay-inset transition-colors hover:border-accent/10"
                >
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute -right-1 -top-1 rounded-full bg-destructive/10 p-1 text-destructive shadow-sm transition-all hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Item Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-foreground outline-none placeholder:text-muted-foreground/30"
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground/50">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                          className="w-full rounded-lg bg-card px-2 py-1 text-xs font-bold text-foreground shadow-clay-sm outline-none"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground/50">Rate ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, "rate", Number(e.target.value))}
                          className="w-full rounded-lg bg-card px-2 py-1 text-xs font-bold text-foreground shadow-clay-sm outline-none"
                        />
                      </div>
                      <div className="flex-1 space-y-1 text-right">
                        <label className="text-[9px] font-black uppercase text-muted-foreground/50">Amount</label>
                        <p className="py-1 text-xs font-black text-accent">{formatCurrency(item.quantity * item.rate)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <Info className="h-4 w-4" />
            <h2 className="text-xs font-black uppercase tracking-widest">Additional Notes</h2>
          </div>
          <textarea
            placeholder="Terms, payment methods, or special notes..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="h-28 w-full resize-none rounded-3xl border-none bg-background p-5 text-sm font-medium text-foreground shadow-clay-inset outline-none placeholder:text-muted-foreground/30"
          />
        </section>
      </div>
    </div>
  );

  const renderPreviewContent = () => (
    <div ref={containerRef} className="relative flex h-full flex-col items-center overflow-y-auto bg-muted/20 p-4 lg:p-8">
      <div className="mb-4 flex w-full max-w-[800px] items-center justify-between px-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Live Paper Preview</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
           <span className="text-[10px] font-bold text-success/80">Sync Active</span>
        </div>
      </div>

      <div
        style={{
          width: "800px",
          minHeight: "1131px",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          marginBottom: `-${1131 * (1 - scale)}px`, 
        }}
        className="flex shrink-0 flex-col overflow-hidden bg-white text-black shadow-2xl transition-transform duration-200"
      >
        <div className="flex items-start justify-between p-12 pb-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tight text-primary">InvoicePro</span>
            </div>
            <div className="text-sm font-medium text-gray-400">
              <p>InvoicePro Solutions Inc.</p>
              <p>123 Business Avenue, Suite 400</p>
              <p>San Francisco, CA 94107</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-gray-100">
              {isEditing ? "Edit" : "New"}
            </h1>
            <div className="mt-4 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Invoice Number</p>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                className="w-32 rounded-lg border-none bg-gray-50/50 px-2 py-1 text-right text-xl font-bold text-black outline-none transition-colors hover:bg-gray-50 focus:ring-0"
              />
            </div>
          </div>
        </div>

        <div className="flex-grow p-12 pt-10">
          <div className="mb-10 h-px w-full bg-gray-100" />
          <div className="mb-12 grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-primary">Bill To</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter customer name..."
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full rounded border-none bg-transparent p-0 text-lg font-bold text-black outline-none transition-colors placeholder:text-gray-200 hover:bg-gray-50/50 focus:ring-0"
                />
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="h-3.5 w-3.5" />
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="flex-grow border-none bg-transparent p-0 text-gray-500 outline-none placeholder:text-gray-200 focus:ring-0"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <input
                    type="text"
                    placeholder="Customer address..."
                    value={form.customerAddress}
                    onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                    className="flex-grow border-none bg-transparent p-0 text-gray-500 outline-none placeholder:text-gray-200 focus:ring-0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-right">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Issue Date</p>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  className="w-full border-none bg-transparent p-0 text-right text-sm font-bold text-black outline-none focus:ring-0"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Due Date</p>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full border-none bg-transparent p-0 text-right text-sm font-bold text-black outline-none focus:ring-0"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Balance Due</p>
                <p className="tabular-nums text-3xl font-black tracking-tighter text-primary">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary/10">
                  <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-300">Description</th>
                  <th className="w-20 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-300">Qty</th>
                  <th className="w-28 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-300">Rate</th>
                  <th className="w-28 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-300">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {form.items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="py-5 pr-4">
                      <input
                        type="text"
                        placeholder="Description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        className="w-full border-none bg-transparent p-0 font-bold text-gray-800 outline-none placeholder:text-gray-200 focus:ring-0"
                      />
                    </td>
                    <td className="py-5 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                        className="w-full border-none bg-transparent p-0 text-center font-medium text-gray-600 outline-none focus:ring-0"
                      />
                    </td>
                    <td className="py-5 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, "rate", Number(e.target.value))}
                        className="w-full border-none bg-transparent p-0 text-right font-medium text-gray-600 outline-none focus:ring-0"
                      />
                    </td>
                    <td className="tabular-nums py-5 text-right font-bold text-gray-800">
                      {formatCurrency(item.quantity * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-12 border-t-2 border-gray-100 pt-10">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300">Notes & Terms</h3>
              <textarea
                placeholder="Add text..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="h-24 w-full resize-none border-none bg-transparent p-0 text-xs text-gray-500 outline-none placeholder:text-gray-200 focus:ring-0"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="font-bold uppercase tracking-widest text-gray-300">Subtotal</span>
                <span className="font-bold text-gray-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold uppercase tracking-widest text-gray-300">Tax (10%)</span>
                <span className="font-bold text-gray-800">{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="text-sm font-black uppercase tracking-widest text-primary">Total Amount</span>
                <span className="tabular-nums text-3xl font-black tracking-tighter text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/50 p-8 text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300">
            Generated with InvoicePro - Professional Billing
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] lg:h-[calc(100vh-64px)] overflow-hidden bg-background -m-4 sm:-m-6 lg:-m-8">
      <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-border/50 bg-card px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/invoices")}
            className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div>
            <h1 className="text-xs font-bold text-foreground sm:text-sm">
              {isEditing ? `Edit Invoice ${id}` : "Create New Invoice"}
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[10px]">InvoicePro Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSave}
            className="hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-clay-sm transition-all hover:shadow-clay sm:flex"
          >
            <Save className="h-3.5 w-3.5 text-accent" />
            Save Draft
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 sm:px-5 py-2 text-xs font-bold text-accent-foreground shadow-clay-sm transition-all hover:opacity-90 active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isEditing ? "Update & Close" : "Submit Invoice"}</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="hidden h-full lg:block">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={45} minSize={30}>
              {renderFormContent()}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={55} minSize={30}>
              {renderPreviewContent()}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        <div className="block h-full lg:hidden">
          <Tabs defaultValue="edit" className="flex h-full w-full flex-col">
            <div className="bg-card px-4 py-3 border-b border-border/50 shadow-sm z-10 shrink-0">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1 h-auto">
                <TabsTrigger value="edit" className="rounded-lg py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-clay-sm data-[state=active]:text-foreground text-muted-foreground">
                  <Settings2 className="mr-2 h-3.5 w-3.5" /> Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-clay-sm data-[state=active]:text-foreground text-muted-foreground">
                  <Eye className="mr-2 h-3.5 w-3.5" /> Preview
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent forceMount value="edit" className="mt-0 flex-1 overflow-hidden border-0 focus-visible:outline-none data-[state=inactive]:hidden data-[state=active]:flex flex-col">
              {renderFormContent()}
            </TabsContent>
            <TabsContent forceMount value="preview" className="mt-0 flex-1 overflow-hidden border-0 focus-visible:outline-none data-[state=inactive]:hidden data-[state=active]:flex flex-col">
              {renderPreviewContent()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
