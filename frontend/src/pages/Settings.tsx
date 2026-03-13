import { motion } from "framer-motion";
import { Building2, Receipt } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Configure your business profile, invoicing preferences, and account settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl bg-card shadow-clay"
        >
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shadow-clay-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-base font-semibold text-foreground">Business Information</h2>
          </div>
          <div className="space-y-4 p-6 pt-2">
            {[
              { label: "Business Name", placeholder: "Your Company" },
              { label: "Email", placeholder: "billing@company.com" },
              { label: "Phone", placeholder: "+1 234 567 890" },
              { label: "Address", placeholder: "123 Business St, City" },
              { label: "Tax ID", placeholder: "XX-XXXXXXX" },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="h-10 w-full rounded-xl bg-background px-3 text-sm text-foreground shadow-clay-inset placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
                />
              </div>
            ))}
            <button className="mt-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed">
              Save Changes
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="rounded-2xl bg-card shadow-clay"
        >
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shadow-clay-sm">
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-base font-semibold text-foreground">Invoice Preferences</h2>
          </div>
          <div className="space-y-4 p-6 pt-2">
            {[
              { label: "Invoice Prefix", placeholder: "INV" },
              { label: "Next Invoice Number", placeholder: "007" },
              { label: "Default Tax Rate (%)", placeholder: "10" },
              { label: "Payment Terms (days)", placeholder: "14" },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="h-10 w-full rounded-xl bg-background px-3 text-sm text-foreground shadow-clay-inset placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
                />
              </div>
            ))}
            <button className="mt-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed">
              Save Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
