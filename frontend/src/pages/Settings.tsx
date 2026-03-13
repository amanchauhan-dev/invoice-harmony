import { motion } from "framer-motion";
import { Building2, Receipt, Loader2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService, ApiSettings, ApiProfile } from "../services/api.service";
import { toast } from "sonner";

const Settings = () => {
  const queryClient = useQueryClient();
  
  // Local state for forms
  const [localSettings, setLocalSettings] = useState<ApiSettings | null>(null);
  const [localProfile, setLocalProfile] = useState<ApiProfile | null>(null);

  // Fetch data
  const { data: serverSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiService.getSettings(),
  });

  const { data: serverProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiService.getProfile(),
  });

  // Sync local state when server data loads
  useEffect(() => {
    if (serverSettings) setLocalSettings(serverSettings);
  }, [serverSettings]);

  useEffect(() => {
    if (serverProfile) setLocalProfile(serverProfile);
  }, [serverProfile]);

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (data: ApiSettings) => apiService.updateSettings(data),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
      toast.success("Settings updated successfully");
    },
    onError: () => toast.error("Failed to update settings")
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<ApiProfile>) => apiService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile")
  });

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSettings) updateSettingsMutation.mutate(localSettings);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (localProfile) updateProfileMutation.mutate({ name: localProfile.name, email: localProfile.email });
  };

  if (settingsLoading || profileLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Configure your business profile, invoicing preferences, and account settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl bg-gradient-to-br from-accent/10 via-card to-card p-0.5 shadow-clay lg:col-span-2"
        >
          <div className="rounded-[15px] bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 shadow-clay-sm">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">Personal Profile</h2>
                <p className="text-[10px] text-muted-foreground">Manage your account identity and email</p>
              </div>
            </div>
            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {[
                { label: "Full Name", key: "name", placeholder: "John Doe" },
                { label: "Email Address", key: "email", placeholder: "john@example.com" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{field.label}</label>
                  <input
                    type="text"
                    value={localProfile?.[field.key as keyof ApiProfile] as string || ""}
                    onChange={(e) => setLocalProfile(prev => prev ? ({ ...prev, [field.key]: e.target.value }) : null)}
                    placeholder={field.placeholder}
                    className="h-10 w-full rounded-xl bg-background px-3 text-sm text-foreground shadow-clay-inset focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
                  />
                </div>
              ))}
              <div className="md:col-span-2 flex justify-end">
                <button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed disabled:opacity-50"
                >
                  {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl bg-card shadow-clay"
        >
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shadow-clay-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-base font-semibold text-foreground">Business Information</h2>
          </div>
          <form onSubmit={handleUpdateSettings} className="space-y-4 p-6 pt-2">
            {[
              { label: "Business Name", key: "companyName", placeholder: "Your Company" },
              { label: "Email", key: "companyEmail", placeholder: "billing@company.com" },
              { label: "Phone", key: "companyPhone", placeholder: "+1 234 567 890" },
              { label: "Address", key: "companyAddress", placeholder: "123 Business St, City" },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{field.label}</label>
                <input
                  type="text"
                  value={localSettings?.[field.key as keyof ApiSettings] as string || ""}
                  onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, [field.key]: e.target.value }) : null)}
                  placeholder={field.placeholder}
                  className="h-10 w-full rounded-xl bg-background px-3 text-sm text-foreground shadow-clay-inset placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
                />
              </div>
            ))}
            <button 
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed disabled:opacity-50"
            >
              {updateSettingsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="rounded-2xl bg-card shadow-clay"
        >
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shadow-clay-sm">
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-base font-semibold text-foreground">Invoice Preferences</h2>
          </div>
          <form onSubmit={handleUpdateSettings} className="space-y-4 p-6 pt-2">
            {[
              { label: "Currency Code", key: "currency", placeholder: "USD" },
              { label: "Default Tax Rate (%)", key: "taxRate", placeholder: "10" },
            ].map((field) => (
              <div key={field.label}>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{field.label}</label>
                <input
                  type="text"
                  value={localSettings?.[field.key as keyof ApiSettings] as string || ""}
                  onChange={(e) => setLocalSettings(prev => prev ? ({ ...prev, [field.key]: field.key === 'taxRate' ? parseFloat(e.target.value) || 0 : e.target.value }) : null)}
                  placeholder={field.placeholder}
                  className="h-10 w-full rounded-xl bg-background px-3 text-sm text-foreground shadow-clay-inset placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 border-0"
                />
              </div>
            ))}
            <button 
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-clay-sm transition-all hover:shadow-clay active:shadow-clay-pressed disabled:opacity-50"
            >
              {updateSettingsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Preferences
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
