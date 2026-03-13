import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Printer,
  Download,
  Mail,
  MapPin,
  FileText,
  Loader2,
  DollarSign,
  History,
  AlertCircle,
} from "lucide-react";
import { apiService, ApiInvoice, ApiPayment } from "../services/api.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ViewInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Payment Recording State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentNote, setPaymentNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Fetch invoice data
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const data = await apiService.getInvoice(id!);
      setPaymentAmount((data.totalAmount - data.paidAmount).toString());
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) {
          const newScale = Math.min(1, Math.max(0.2, (w - 40) / 800));
          setScale(newScale);
        }
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const recordPaymentMutation = useMutation({
    mutationFn: (payload: { invoiceId: string; amount: number; paymentMethod: string; notes?: string }) => apiService.createPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      // Also invalidate payments list and dashboard
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast.success("Payment recorded successfully");
      setShowPaymentModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment");
    }
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || !id) return;
    
    recordPaymentMutation.mutate({
      invoiceId: id,
      amount: parseFloat(paymentAmount),
      paymentMethod,
      notes: paymentNote
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-y-auto bg-muted/30 pb-20 pt-6 sm:pt-8 print:bg-white print:p-0 print:pb-0 scrollbar-hide">
      {/* Action Bar */}
      <div className="mx-auto max-w-[21cm] mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 print:hidden">
        <button
          onClick={() => navigate("/invoices")}
          className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-xs sm:text-sm font-medium text-foreground shadow-clay-sm transition-all hover:shadow-clay"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Invoices</span>
        </button>
        <div className="flex items-center gap-3">
          {invoice.status !== "Paid" && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-accent-foreground shadow-clay-sm transition-all hover:opacity-90 active:scale-95"
            >
              <DollarSign className="h-4 w-4" />
              Record Payment
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-clay-sm transition-all hover:opacity-90 active:scale-95"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex flex-col items-center justify-center overflow-x-hidden pb-10 scrollbar-hide px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: "800px",
            minHeight: "1131px",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            marginBottom: `-${1131 * (1 - scale)}px`, 
          }}
          className="bg-white text-black shadow-2xl print:max-w-full print:shadow-none flex flex-col shrink-0"
        >
          {/* Header */}
          <div className="p-12 pb-8 flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-primary">InvoiceHarmony</span>
              </div>
              <div className="text-sm font-medium text-gray-500">
                <p>InvoiceHarmony Solutions</p>
                <p>support@invoiceharmony.com</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-5xl font-black text-gray-100 uppercase tracking-tighter">Invoice</h1>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Number</p>
                <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          <div className="p-12 pt-0">
            <div className="h-px bg-gray-100 w-full mb-10" />

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-primary">Bill To</h2>
                <div className="space-y-1">
                  <p className="text-lg font-bold">{invoice.customerName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Mail className="h-3.5 w-3.5" /> 
                    <span>{invoice.customerEmail}</span>
                  </div>
                  {invoice.customerAddress && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" /> 
                      <span>{invoice.customerAddress}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-right sm:text-left">
                {[
                  { label: "Issue Date", value: format(new Date(invoice.issueDate), "MMM dd, yyyy") },
                  { label: "Due Date", value: format(new Date(invoice.dueDate), "MMM dd, yyyy") },
                  { label: "Total Amount", value: `$${invoice.totalAmount.toFixed(2)}`, big: true },
                  { label: "Status", value: invoice.status, color: invoice.status === 'Paid' ? 'text-green-600' : 'text-orange-600' },
                ].map((item, idx) => (
                  <div key={idx} className={`space-y-1 ${idx >= 2 ? 'mt-4' : ''}`}>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                    <p className={`${item.big ? 'text-2xl font-black text-primary' : 'text-sm font-bold'} ${item.color || ''}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="mb-12">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary/10">
                    <th className="py-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">Description</th>
                    <th className="py-4 text-center text-xs font-black uppercase tracking-widest text-gray-400 w-24">Qty</th>
                    <th className="py-4 text-right text-xs font-black uppercase tracking-widest text-gray-400 w-32">Rate</th>
                    <th className="py-4 text-right text-xs font-black uppercase tracking-widest text-gray-400 w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-6 pr-4">
                        <p className="font-bold text-gray-800">{item.description}</p>
                      </td>
                      <td className="py-6 text-center text-gray-600 font-medium">{item.quantity}</td>
                      <td className="py-6 text-right text-gray-600 font-medium">${item.rate.toFixed(2)}</td>
                      <td className="py-6 text-right font-bold text-gray-800">${(item.quantity * item.rate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Payments */}
            <div className="grid grid-cols-2 gap-12 pt-8 border-t-2 border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Payment History</h3>
                </div>
                {invoice.payments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {invoice.payments.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
                        <div>
                          <p className="font-bold text-gray-700">{p.paymentMethod}</p>
                          <p className="text-gray-400">{format(new Date(p.paymentDate), "MMM dd, yyyy")}</p>
                        </div>
                        <p className="font-black text-primary">${p.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">${invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">Amount Paid</span>
                  <span className="font-bold text-green-600">-${invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-primary/20 pt-4">
                  <span className="text-lg font-black uppercase tracking-widest text-primary">Balance Due</span>
                  <span className="text-2xl font-black text-primary">${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-20">
                <div className="rounded-2xl bg-gray-50 p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Notes</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{invoice.notes}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md rounded-3xl bg-card border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Record Payment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Payment Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="h-10 w-full rounded-xl bg-background pl-7 pr-3 text-sm text-foreground shadow-clay-inset focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-10 w-full rounded-xl bg-background px-3 text-sm text-foreground shadow-clay-inset focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
              >
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Credit Card</option>
                <option>PayPal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (Optional)</label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full rounded-xl bg-background p-3 text-sm text-foreground shadow-clay-inset focus:outline-none focus:ring-2 focus:ring-accent/30 border-0 min-h-[80px]"
                placeholder="Reference number, etc."
              />
            </div>
            
            {(invoice.totalAmount - invoice.paidAmount) < parseFloat(paymentAmount) && (
              <div className="flex items-center gap-2 text-[11px] text-orange-500 bg-orange-500/10 p-2 rounded-lg font-medium">
                <AlertCircle className="h-3 w-3" />
                Warning: Payment exceeds balance due.
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 rounded-xl bg-background py-3 text-sm font-bold text-foreground shadow-clay-sm hover:shadow-clay"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={recordPaymentMutation.isPending}
                className="flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-accent-foreground shadow-clay-sm hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {recordPaymentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> : null}
                Record
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewInvoice;
