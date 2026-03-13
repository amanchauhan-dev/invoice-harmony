export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface ApiInvoiceItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  customer?: { id: string; name: string };
  items?: ApiInvoiceItem[];
  createdAt: string;
}

export interface ApiPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  invoice?: {
    invoiceNumber: string;
    customer?: {
      name: string;
    }
  }
}

export interface ApiSettings {
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
  companyAddress?: string;
  currency: string;
  taxRate: number;
}

export interface ApiProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    invoices: number;
  };
}

export interface CreateInvoiceRequest {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string | Date;
  dueDate: string | Date;
  notes?: string;
  items: Omit<ApiInvoiceItem, 'id' | 'invoiceId'>[];
  subtotal: number;
  tax: number;
  totalAmount: number;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface ApiDashboardOverview {
  overview: {
    totalRevenue: number;
    totalInvoices: number;
    pendingPayments: number;
    activeCustomers: number;
    currency: string;
  };
  recentInvoices: ApiInvoice[];
  monthlyRevenue: {
    total: number;
    collected: number;
    pending: number;
    overdue: number;
    currency: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {
  // Auth
  async login(data: LoginRequest): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to login');
    }
    return res.json();
  },

  async register(data: RegisterRequest): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to register');
    }
    return res.json();
  },

  // Invoices
  async getInvoices(): Promise<ApiInvoice[]> {
    const res = await fetch(`${API_BASE_URL}/invoices`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  async getInvoice(id: string): Promise<ApiInvoice & { items: ApiInvoiceItem[], payments: ApiPayment[] }> {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch invoice');
    return res.json();
  },

  async createInvoice(data: CreateInvoiceRequest): Promise<ApiInvoice> {
    const res = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create invoice');
    return res.json();
  },

  async deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete invoice');
    }
  },

  // Profile
  async getProfile(): Promise<ApiProfile> {
    const res = await fetch(`${API_BASE_URL}/profile`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data: Partial<ApiProfile>): Promise<ApiProfile> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Payments
  async getAllPayments(): Promise<ApiPayment[]> {
    const res = await fetch(`${API_BASE_URL}/payments`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async getInvoicePayments(invoiceId: string): Promise<ApiPayment[]> {
    const res = await fetch(`${API_BASE_URL}/payments/invoice/${invoiceId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async createPayment(data: { invoiceId: string; amount: number; paymentMethod: string; notes?: string }): Promise<ApiPayment> {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create payment');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<ApiSettings> {
    const res = await fetch(`${API_BASE_URL}/settings`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data: ApiSettings): Promise<ApiSettings> {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update settings');
    }
    return res.json();
  },

  // Dashboard
  async getDashboardOverview(): Promise<ApiDashboardOverview> {
    const res = await fetch(`${API_BASE_URL}/dashboard/overview`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard overview');
    return res.json();
  },

  // Customers
  async getCustomers(): Promise<ApiCustomer[]> {
    const res = await fetch(`${API_BASE_URL}/customers`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomer(id: string): Promise<ApiCustomer & { invoices: ApiInvoice[] }> {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch customer');
    return res.json();
  },

  async createCustomer(data: CreateCustomerRequest): Promise<ApiCustomer> {
    const res = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  },

  async updateCustomer(id: string, data: Partial<CreateCustomerRequest>): Promise<ApiCustomer> {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update customer');
    return res.json();
  },

  async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete customer');
  },

  // Public (no auth)
  async getPublicInvoice(id: string): Promise<ApiInvoice & {
    items: ApiInvoiceItem[];
    payments: ApiPayment[];
    company: {
      name: string; email: string; phone: string;
      address: string; logo: string | null; currency: string; taxRate: number;
    }
  }> {
    const res = await fetch(`${API_BASE_URL}/invoices/public/${id}`);
    if (!res.ok) throw new Error('Invoice not found');
    return res.json();
  },

  async createPublicPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiPayment> {
    const res = await fetch(`${API_BASE_URL}/payments/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Payment failed');
    }
    return res.json();
  },
};
