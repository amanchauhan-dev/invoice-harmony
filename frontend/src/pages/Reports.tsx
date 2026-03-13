import { motion } from "framer-motion";
import { BarChart3, TrendingUp, FileText, Users } from "lucide-react";

const Reports = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Reports</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Financial insights, analytics and performance trends.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: TrendingUp, title: "Revenue Overview", desc: "Monthly and yearly revenue trends", color: "bg-success/10 text-success" },
          { icon: FileText, title: "Invoice Summary", desc: "Status breakdown of all invoices", color: "bg-accent/10 text-accent" },
          { icon: Users, title: "Top Customers", desc: "Highest revenue-generating clients", color: "bg-primary/10 text-primary" },
        ].map((report, i) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="cursor-pointer rounded-2xl bg-card p-6 shadow-clay transition-shadow hover:shadow-clay-sm active:shadow-clay-pressed"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${report.color} shadow-clay-sm`}>
              <report.icon className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-base font-semibold text-foreground">{report.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{report.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="flex h-64 items-center justify-center rounded-2xl bg-card shadow-clay"
      >
        <div className="text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Connect a database to view real reports</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
