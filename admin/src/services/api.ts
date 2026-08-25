import { env } from "../config/env";

// ─── Types ───
export interface PageAccess {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  page: { id: string; slug: string; name: string; icon?: string; category?: string };
}

export interface AssignedRole {
  id: string;
  name: string;
  displayName: string;
  color: string;
  theme: string;
  pages: PageAccess[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  assignedRole?: AssignedRole | null;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  requiresOTP?: boolean;
}

export interface ApiResponse {
  message: string;
}

// ─── Fetch Wrapper ───
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${env.API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

// ─── Auth API ───
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/admin-register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  logout: () =>
    request<ApiResponse>("/auth/logout", { method: "POST" }),

  sendOTP: (email: string) =>
    request<ApiResponse>("/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) }),

  verifyOTP: (email: string, otp: string) =>
    request<ApiResponse>("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),

  getMe: () =>
    request<{ user: User }>("/auth/me"),
};

// ─── KYC Types ───
export interface KycSubmission {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: { countryCode: string; number: string };
  gender: string;
  dateOfBirth: string;
  age?: number;
  country: string;
  governmentIdType: string;
  documentUrl: string;
  documentUrlBack?: string;
  addressProofType?: string;
  addressDocUrl?: string;
  addressDocUrlBack?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string };
}

export interface KycListResponse {
  submissions: KycSubmission[];
  total: number;
  page: number;
  limit: number;
  counts: { pending: number; approved: number; rejected: number; total: number };
}

// ─── KYC API ───
export const kycAPI = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    request<KycListResponse>("/admin/kyc" + (params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "")),
  getDetail: (id: string) =>
    request<{ submission: KycSubmission }>(`/admin/kyc/${id}`),
  approve: (id: string) =>
    request<{ message: string; submission: KycSubmission }>(`/admin/kyc/${id}/approve`, { method: "POST" }),
  reject: (id: string, reason: string) =>
    request<{ message: string; submission: KycSubmission }>(`/admin/kyc/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
};

// ─── Payment Types ───
export type PaymentType = "DEPOSIT" | "WITHDRAWAL" | "BONUS_WITHDRAWAL";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface PaymentRequest {
  id: string;
  walletId: string;
  type: PaymentType;
  amount: string;
  status: PaymentStatus;
  description: string | null;
  screenshotUrl: string | null;
  transactionId: string | null;
  upiId: string | null;
  currency: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string } | null;
}

export interface PaymentListResponse {
  payments: PaymentRequest[];
  total: number;
  page: number;
  limit: number;
  counts: {
    pendingDeposits: number;
    pendingWithdrawals: number;
    completed: number;
    rejected: number;
    total: number;
  };
}

// ─── Payments API ───
export const paymentsAPI = {
  getAll: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
    request<PaymentListResponse>("/admin/payments" + (params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "")),
  getDetail: (id: string) =>
    request<{ payment: PaymentRequest }>(`/admin/payments/${id}`),
  approve: (id: string) =>
    request<{ message: string; payment: PaymentRequest }>(`/admin/payments/${id}/approve`, { method: "POST" }),
  reject: (id: string, reason: string) =>
    request<{ message: string; payment: PaymentRequest }>(`/admin/payments/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
};

// ─── Users (Admin) API ───
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  assignedRoleId: string | null;
  theme: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  assignedRole?: { id: string; name: string; displayName: string; color: string; theme: string } | null;
}

export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: boolean }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) query.set(k, String(v));
      });
    }
    const qs = query.toString();
    return request<{ users: (AdminUser & { wallet?: { currency: string; balance: string } | null })[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/users${qs ? `?${qs}` : ""}`);
  },
  toggleActive: (id: string) =>
    request<{ message: string; user: AdminUser }>(`/users/${id}/toggle-active`, { method: "POST" }),
  setCurrency: (id: string, currency: "USD") =>
    request<{ message: string; wallet: { userId: string; currency: string } }>(`/users/${id}/currency`, { method: "POST", body: JSON.stringify({ currency }) }),
  delete: (id: string) =>
    request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
};

// ─── Referral Types ───
export interface ReferralSettings {
  id: string;
  commissionRate: string;
  isActive: boolean;
}

export interface AdminReferral {
  id: string;
  status: string;
  code: string;
  registeredAt: string;
  kycAt: string | null;
  depositedAt: string | null;
  referrer: { id: string; name: string; email: string };
  referred: { id: string; name: string; email: string };
  commissions: { id: string; amount: string; percentage: string; status: string }[];
}

// ─── Referral API ───
export const referralAPI = {
  getSettings: () => request<{ settings: ReferralSettings }>("/admin/referrals/settings"),
  updateSettings: (commissionRate: number) =>
    request<{ message: string; settings: ReferralSettings }>("/admin/referrals/settings", {
      method: "PUT",
      body: JSON.stringify({ commissionRate }),
    }),
  getAll: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.set(k, String(v)); });
    const qs = query.toString();
    return request<{ referrals: AdminReferral[]; total: number }>(`/admin/referrals${qs ? `?${qs}` : ""}`);
  },
};

// ─── Index Types ───
export interface IndexTier {
  id: string;
  minAmount: string;
  maxAmount: string;
  label: string;
  tagline: string | null;
  durationMonths: number;
  weeklyReturn: string;
  monthlyReturn: string;
  halfYearlyReturn: string;
  maintenanceFeePercent: string;
  exitFeePercent: string;
  earlyExitFeePercent: string;
  isActive: boolean;
  createdAt: string;
}

export interface IndexPriceEntry {
  id: string;
  price: string;
  changePercent: string;
  changeAmount: string;
  dateLabel: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface IndexManager {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface IndexSettings {
  id: string;
  maintenanceFeePercent: string;
  level1Percent: string;
  level2Percent: string;
  level3Percent: string;
  level4Percent: string;
  level5Percent: string;
  earlyWithdrawalPercent: string;
  maturityWithdrawalFee: string;
}

export interface IndexInvestmentRecord {
  id: string;
  userId: string;
  tierId: string;
  amount: string;
  feeAmount: string;
  netAmount: string;
  status: "ACTIVE" | "MATURED" | "CANCELLED";
  activatedAt: string;
  maturesAt: string | null;
  withdrawnAt: string | null;
  withdrawalFee: string | null;
  payoutAmount: string | null;
  createdAt: string;
  tier: IndexTier;
  user: { id: string; name: string; email: string };
}

// ─── Index API ───
export const indexAPI = {
  getTiers: () => request<{ tiers: IndexTier[] }>("/admin/index/tiers"),
  createTier: (data: { minAmount: number; maxAmount: number; label: string; tagline?: string; durationMonths?: number; weeklyReturn: number; monthlyReturn: number; halfYearlyReturn: number; maintenanceFeePercent?: number; exitFeePercent?: number; earlyExitFeePercent?: number }) =>
    request<{ message: string; tier: IndexTier }>("/admin/index/tiers", { method: "POST", body: JSON.stringify(data) }),
  updateTier: (id: string, data: Partial<IndexTier>) =>
    request<{ message: string; tier: IndexTier }>(`/admin/index/tiers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTier: (id: string) =>
    request<{ message: string }>(`/admin/index/tiers/${id}`, { method: "DELETE" }),

  getPrices: () => request<{ prices: IndexPriceEntry[] }>("/admin/index/prices"),
  createPrice: (data: { price: number; changePercent?: number; changeAmount?: number; dateLabel?: string }) =>
    request<{ message: string; price: IndexPriceEntry }>("/admin/index/prices", { method: "POST", body: JSON.stringify(data) }),
  updatePrice: (id: string, data: Partial<IndexPriceEntry>) =>
    request<{ message: string; price: IndexPriceEntry }>(`/admin/index/prices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePrice: (id: string) =>
    request<{ message: string }>(`/admin/index/prices/${id}`, { method: "DELETE" }),

  getManager: () => request<{ manager: IndexManager | null }>("/admin/index/manager"),
  upsertManager: (data: { name: string; title: string; bio?: string; imageUrl?: string }) =>
    request<{ message: string; manager: IndexManager }>("/admin/index/manager", { method: "POST", body: JSON.stringify(data) }),

  getInvestments: () => request<{ investments: IndexInvestmentRecord[] }>("/admin/index/investments"),

  getSettings: () => request<{ settings: IndexSettings }>("/admin/index/settings"),
  updateSettings: (data: Partial<{ maintenanceFeePercent: number; level1Percent: number; level2Percent: number; level3Percent: number; level4Percent: number; level5Percent: number; earlyWithdrawalPercent: number; maturityWithdrawalFee: number }>) =>
    request<{ message: string; settings: IndexSettings }>("/admin/index/settings", { method: "PUT", body: JSON.stringify(data) }),
};

// ─── Support Tickets (Admin) API ───
export type SupportCategory = "TECHNICAL" | "BILLING" | "KYC" | "ACCOUNT" | "OTHER";
export type SupportTicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface SupportTicket {
  id: string;
  userId: string;
  category: SupportCategory;
  subject: string;
  message: string;
  screenshotUrls: string[];
  status: SupportTicketStatus;
  adminNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string; role: string };
}

export interface SupportTicketListResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  counts: { open: number; inProgress: number };
}

export const supportTicketsAPI = {
  getAll: (params?: { status?: string; category?: string; page?: number; limit?: number }) =>
    request<SupportTicketListResponse>("/admin/support-tickets" + (params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "")),
  getDetail: (id: string) =>
    request<{ ticket: SupportTicket }>(`/admin/support-tickets/${id}`),
  update: (id: string, data: { status?: SupportTicketStatus; adminNote?: string }) =>
    request<{ message: string; ticket: SupportTicket }>(`/admin/support-tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ─── Platform Wallet (Admin) API ───
export interface PlatformWalletData {
  id: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformLedgerEntry {
  id: string;
  platformWalletId: string;
  type: "FEE_CREDIT" | "WITHDRAWAL";
  amount: string;
  description: string | null;
  indexInvestmentId: string | null;
  investor: { id: string; name: string; email: string } | null;
  createdAt: string;
}

export interface PlatformWithdrawalRecord {
  id: string;
  platformWalletId: string;
  amount: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  destination: string;
  note: string | null;
  requestedBy: string;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: { id: string; name: string; email: string } | null;
  processor?: { id: string; name: string; email: string } | null;
}

export const platformWalletAPI = {
  get: () => request<{ wallet: PlatformWalletData; pendingWithdrawal: PlatformWithdrawalRecord | null }>("/admin/platform-wallet"),
  getLedger: (params?: { page?: number; limit?: number }) =>
    request<{ entries: PlatformLedgerEntry[]; total: number; page: number; limit: number; totalPages: number }>(
      "/admin/platform-wallet/ledger" + (params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "")
    ),
  getWithdrawals: (params?: { status?: string; page?: number; limit?: number }) =>
    request<{ withdrawals: PlatformWithdrawalRecord[]; total: number; page: number; limit: number; totalPages: number }>(
      "/admin/platform-wallet/withdrawals" + (params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "")
    ),
  requestWithdrawal: (data: { amount: number; destination: string; note?: string }) =>
    request<{ message: string; withdrawal: PlatformWithdrawalRecord }>("/admin/platform-wallet/withdrawals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  processWithdrawal: (id: string, action: "approve" | "reject", note?: string) =>
    request<{ message: string; withdrawal: PlatformWithdrawalRecord }>(`/admin/platform-wallet/withdrawals/${id}/process`, {
      method: "POST",
      body: JSON.stringify({ action, note }),
    }),
};
