import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "../services/api.service";
import { toast } from "sonner";
import {
  CheckCircle2, AlertCircle, Loader2, Building2, Mail, MapPin, Phone,
  Download, CreditCard, FileText, Calendar, ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

type PaymentStep = "view" | "pay" | "paid";

const PayInvoice = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [step, setStep] = useState<PaymentStep>("view");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentNotes, setPaymentNotes] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ["public-invoice", invoiceId],
    queryFn: () => apiService.getPublicInvoice(invoiceId!),
    enabled: !!invoiceId,
    retry: 1,
  });

  const payMutation = useMutation({
    mutationFn: () =>
      apiService.createPublicPayment({
        invoiceId: invoiceId!,
        amount: invoice ? invoice.totalAmount - invoice.paidAmount : 0,
        paymentMethod,
        notes: paymentNotes || undefined,
      }),
    onSuccess: () => {
      toast.success("Payment recorded successfully!");
      setStep("paid");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const downloadReceiptPDF = async () => {
    if (!receiptRef.current) return;
    toast.info("Generating receipt PDF…");
    const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgRatio = canvas.width / canvas.height;
    const pdfImgWidth = pageWidth;
    const pdfImgHeight = pdfImgWidth / imgRatio;
    let y = 0;
    while (y < pdfImgHeight) {
      if (y > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -y, pdfImgWidth, pdfImgHeight);
      y += pageHeight;
    }
    pdf.save(`receipt-${invoice?.invoiceNumber || invoiceId}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        {/* Banner skeleton */}
        <div className="sticky top-0 z-10 border-b border-white/5 bg-slate-900/80 px-6 py-3">
          <div className="mx-auto flex max-w-4xl items-center justify-between animate-pulse">
            <div className="h-4 w-40 rounded bg-slate-700" />
            <div className="h-6 w-24 rounded-full bg-slate-700" />
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-pulse">
          {/* Invoice card skeleton */}
          <div className="rounded-3xl overflow-hidden bg-white shadow-2xl mb-6">
            {/* Dark header */}
            <div className="bg-slate-900 p-8 sm:p-12 flex justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-700" />
                  <div className="h-5 w-40 rounded bg-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-36 rounded bg-slate-800" />
                  <div className="h-3 w-28 rounded bg-slate-800" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 w-20 rounded bg-slate-800" />
                <div className="h-8 w-32 rounded-xl bg-slate-700" />
                <div className="h-3 w-28 rounded bg-slate-800" />
              </div>
            </div>
            {/* Bill to + summary */}
            <div className="grid sm:grid-cols-2 gap-6 border-b border-slate-100 p-8 sm:p-12">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-gray-200" />
                <div className="h-5 w-36 rounded bg-gray-200" />
                <div className="h-3 w-40 rounded bg-gray-100" />
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3.5 w-20 rounded bg-gray-100" />
                    <div className="h-3.5 w-24 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            </div>
            {/* Line items */}
            <div className="p-8 sm:p-12 space-y-3">
              <div className="h-3 w-20 rounded bg-gray-200" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div className="h-4 w-56 rounded bg-gray-100" />
                  <div className="flex gap-8">
                    <div className="h-4 w-8 rounded bg-gray-100" />
                    <div className="h-4 w-16 rounded bg-gray-100" />
                    <div className="h-4 w-16 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Action card skeleton */}
          <div className="rounded-3xl bg-slate-800/60 p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-700" />
              <div className="h-5 w-32 rounded bg-slate-700" />
              <div className="h-4 w-48 rounded bg-slate-800" />
              <div className="h-10 w-36 rounded-xl bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-400" />
        <h1 className="text-2xl font-bold text-white">Invoice Not Found</h1>
        <p className="text-slate-400">This invoice link may be invalid or expired.</p>
      </div>
    );
  }

  const balanceDue = invoice.totalAmount - invoice.paidAmount;
  const isPaid = invoice.status === "Paid" || balanceDue <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      {/* Banner */}
      <div className="sticky top-0 z-10 border-b border-white/5 bg-slate-900/80 px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-bold text-white">{invoice.company.name}</span>
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            isPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
          }`}>
            {isPaid ? "Paid" : "Payment Due"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

        {/* ── Invoice Paper ── */}
        <div ref={step === "paid" ? receiptRef : undefined} className="mb-6 overflow-hidden rounded-3xl bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-start justify-between bg-slate-900 p-8 sm:p-12">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">{invoice.company.name}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                {invoice.company.email && (
                  <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /><span>{invoice.company.email}</span></div>
                )}
                {invoice.company.phone && (
                  <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /><span>{invoice.company.phone}</span></div>
                )}
                {invoice.company.address && (
                  <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /><span>{invoice.company.address}</span></div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Invoice</p>
              <p className="text-2xl font-black text-white">{invoice.invoiceNumber}</p>
              <div className="mt-3 space-y-1 text-xs text-slate-400">
                <p><span className="text-slate-500">Issued: </span>{format(new Date(invoice.issueDate), "MMM dd, yyyy")}</p>
                <p><span className="text-slate-500">Due: </span>{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </div>

          {/* Bill To + Summary */}
          <div className="grid grid-cols-1 gap-6 border-b border-slate-100 p-8 sm:grid-cols-2 sm:p-12">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Bill To</p>
              <p className="text-base font-bold text-slate-900">{invoice.customerName}</p>
              {invoice.customerEmail && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><Mail className="h-3 w-3" /> {invoice.customerEmail}</p>
              )}
              {invoice.customerAddress && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {invoice.customerAddress}</p>
              )}
            </div>
            <div className="flex flex-col justify-end gap-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(invoice.subtotal, invoice.company.currency)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-500">Tax ({invoice.company.taxRate}%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(invoice.tax, invoice.company.currency)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-500">Paid</span>
                  <span className="font-bold text-emerald-600">-{formatCurrency(invoice.paidAmount, invoice.company.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-base font-black uppercase tracking-wide text-slate-700">Balance Due</span>
                <span className="text-xl font-black text-indigo-600">{formatCurrency(balanceDue, invoice.company.currency)}</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-8 sm:p-12">
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Line Items</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="pb-3 text-left">Description</th>
                  <th className="pb-3 text-center w-16">Qty</th>
                  <th className="pb-3 text-right w-24">Rate</th>
                  <th className="pb-3 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoice.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 pr-4 font-medium text-slate-800">{item.description || "—"}</td>
                    <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600">{formatCurrency(item.rate, invoice.company.currency)}</td>
                    <td className="py-4 text-right font-bold text-slate-800">{formatCurrency(item.quantity * item.rate, invoice.company.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 p-8 sm:px-12">
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment History</p>
              {invoice.payments.map((p, i) => (
                <div key={i} className="flex justify-between text-xs text-slate-600 py-1">
                  <span>{p.paymentMethod} · {format(new Date(p.paymentDate), "MMM dd, yyyy")}</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(p.amount, invoice.company.currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Receipt stamp for paid */}
          {step === "paid" && (
            <div className="border-t border-emerald-100 bg-emerald-50 p-8 text-center sm:px-12">
              <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
              <p className="text-base font-black text-emerald-700">Payment Confirmed</p>
              <p className="text-xs text-emerald-600">Paid via {paymentMethod} on {format(new Date(), "MMMM dd, yyyy")}</p>
            </div>
          )}
        </div>

        {/* ── Action Area ── */}
        {!isPaid && step !== "paid" && (
          <div className="rounded-3xl bg-slate-800/60 p-6 backdrop-blur-sm sm:p-8">
            {step === "view" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20">
                  <CreditCard className="h-7 w-7 text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Ready to pay?</p>
                  <p className="text-sm text-slate-400">
                    Balance due: <span className="font-bold text-indigo-300">{formatCurrency(balanceDue, invoice.company.currency)}</span>
                  </p>
                </div>
                <button
                  onClick={() => setStep("pay")}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-95"
                >
                  Proceed to Pay <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === "pay" && (
              <div className="space-y-4">
                <p className="text-center text-base font-bold text-white">Choose Payment Method</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full rounded-xl bg-slate-700 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Bank Transfer</option>
                      <option>Credit Card</option>
                      <option>Cash</option>
                      <option>PayPal</option>
                      <option>Crypto</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Notes (Optional)</label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={e => setPaymentNotes(e.target.value)}
                      placeholder="Reference number, transaction ID…"
                      className="w-full rounded-xl bg-slate-700 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep("view")}
                    className="flex-1 rounded-xl bg-slate-700 py-2.5 text-sm font-bold text-slate-300 hover:bg-slate-600"
                  >
                    Back
                  </button>
                  <button
                    disabled={payMutation.isPending}
                    onClick={() => payMutation.mutate()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {payMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    Confirm Payment of {formatCurrency(balanceDue, invoice.company.currency)}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Already paid */}
        {(isPaid && step !== "paid") && (
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-emerald-900/30 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <p className="text-lg font-bold text-emerald-300">This invoice has already been paid</p>
          </div>
        )}

        {/* Receipt download */}
        {step === "paid" && (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl bg-emerald-900/30 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <p className="text-lg font-bold text-emerald-300">Payment Successful!</p>
            <p className="text-sm text-slate-400">Your receipt is ready. Download it for your records.</p>
            <button
              onClick={downloadReceiptPDF}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
            >
              <Download className="h-4 w-4" /> Download Receipt PDF
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-slate-600">
          Powered by <span className="font-bold text-slate-500">InvoiceHarmony</span> · Secure payment portal
        </p>
      </div>
    </div>
  );
};

export default PayInvoice;
