import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
} from "lucide-react";

// --- Mock Data Lookup (matching seedInvoices) ---
const mockInvoices = [
  { id: "INV-001", customer: "Acme Corp", amount: "$2,500.00", status: "Paid", date: "Mar 12, 2026", due: "Mar 26, 2026", items: [{ desc: "Web Development", qty: 40, rate: 50, total: 2000 }, { desc: "UI Design", qty: 10, rate: 50, total: 500 }] },
  { id: "INV-002", customer: "TechStart Inc", amount: "$1,800.00", status: "Sent", date: "Mar 11, 2026", due: "Mar 25, 2026", items: [{ desc: "Software Consulting", qty: 12, rate: 150, total: 1800 }] },
];

const ViewInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Find invoice or use default
  const invoice = mockInvoices.find(inv => inv.id === id) || {
    id: id || "INV-000",
    customer: "Sample Customer",
    amount: "$0.00",
    status: "Draft",
    date: "Mar 13, 2026",
    due: "Mar 27, 2026",
    items: [{ desc: "Product/Service Description", qty: 1, rate: 0, total: 0 }]
  };

  const handlePrint = () => {
    window.print();
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
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

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-y-auto bg-muted/30 pb-20 pt-6 sm:pt-8 print:bg-white print:p-0 print:pb-0 scrollbar-hide">
      {/* Action Bar - Hidden during print */}
      <div className="mx-auto max-w-[21cm] mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 print:hidden">
        <button
          onClick={() => navigate("/invoices")}
          className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-xs sm:text-sm font-medium text-foreground shadow-clay-sm transition-all hover:shadow-clay"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sm:inline">Back to Invoices</span>
          <span className="hidden sm:inline">List</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-clay-sm transition-all hover:opacity-90 active:scale-95 sm:flex-none"
          >
            <Printer className="h-4 w-4" />
            Print / PDF
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-card px-4 py-2 text-xs sm:text-sm font-medium text-foreground shadow-clay-sm transition-all hover:shadow-clay sm:flex-none">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* A4 Invoice Paper Container with responsive scaling */}
      <div ref={containerRef} className="flex flex-col items-center justify-center overflow-x-hidden pb-10 scrollbar-hide px-4 sm:px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: "800px",
            minHeight: "1131px",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            marginBottom: `-${1131 * (1 - scale)}px`, 
          }}
          className="bg-white text-black shadow-2xl print:max-w-full print:shadow-none flex flex-col shrink-0"
        >
        {/* Invoice Header */}
        <div className="p-12 pb-0 flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-primary">InvoicePro</span>
            </div>
            <div className="text-sm font-medium text-gray-500">
              <p>InvoicePro Solutions Inc.</p>
              <p>123 Business Avenue, Suite 400</p>
              <p>San Francisco, CA 94107</p>
              <p>United States</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-5xl font-black text-gray-200 uppercase tracking-tighter">Invoice</h1>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Number</p>
              <p className="text-xl font-bold">{invoice.id}</p>
            </div>
          </div>
        </div>

        <div className="p-12 pt-10">
          <div className="h-px bg-gray-100 w-full mb-10" />

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-primary">Bill To</h2>
              <div className="space-y-1">
                <p className="text-lg font-bold">{invoice.customer}</p>
                <p className="text-sm text-gray-500">Global Customer Inc.</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <Mail className="h-3.5 w-3.5" /> 
                  <span>contact@customer.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" /> 
                  <span>456 Client Road, Enterprise City</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Issue Date</p>
                <p className="text-sm font-bold">{invoice.date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Due Date</p>
                <p className="text-sm font-bold">{invoice.due}</p>
              </div>
              <div className="space-y-1 mt-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Amount Due</p>
                <p className="text-2xl font-black text-primary">{invoice.amount}</p>
              </div>
              <div className="space-y-1 mt-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Status</p>
                <p className={`text-sm font-bold ${invoice.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                  {invoice.status}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
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
                      <p className="font-bold text-gray-800">{item.desc}</p>
                      <p className="text-xs text-gray-400 mt-1">Standard service provision for the above project.</p>
                    </td>
                    <td className="py-6 text-center text-gray-600 font-medium">{item.qty}</td>
                    <td className="py-6 text-right text-gray-600 font-medium">${item.rate.toFixed(2)}</td>
                    <td className="py-6 text-right font-bold text-gray-800">${(item.qty * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end pt-8 border-t-2 border-gray-100">
            <div className="w-72 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-bold">{invoice.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Tax (0%)</span>
                <span className="font-bold">$0.00</span>
              </div>
              <div className="flex justify-between border-t-2 border-primary/20 pt-4">
                <span className="text-lg font-black uppercase tracking-widest text-primary">Total</span>
                <span className="text-2xl font-black text-primary">{invoice.amount}</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-20">
            <div className="rounded-2xl bg-gray-50 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Terms & Conditions</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Please process payment within the due date mentioned above. For payment queries, contact billing@invoicepro.com.
                Transferred funds should be directed to the account provided in your service contract.
              </p>
            </div>
          </div>
        </div>

        {/* Final Branding / Footer */}
        <div className="mt-auto p-12 text-center border-t border-gray-50">
          <p className="text-xs text-gray-300 font-medium uppercase tracking-widest">
            Thank you for your business! &copy; 2026 InvoicePro Solutions.
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);
};

export default ViewInvoice;
