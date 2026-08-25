"use client";

import { env } from "@/lib/env";

// ─── Types ───
export interface PageAccess {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  page: {
    id: string;
    slug: string;
    name: string;
    icon: string | null;
    category: string;
  };
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
  isActive: boolean;
  assignedRoleId: string | null;
  assignedRole: AssignedRole | null;
  theme: string | null;
  createdAt?: string;
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

export interface KycData {
  id: string;
  userId: string;
  status: "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED";
  fullName: string | null;
  email: string | null;
  emailVerified: boolean;
  phone: string | null;
  countryCode: string | null;
  phoneVerified: boolean;
  gender: string | null;
  dateOfBirth: string | null;
  age: number | null;
  country: string | null;
  governmentIdType: string | null;
  documentUrl: string | null;
  documentFileName: string | null;
  documentUrlBack: string | null;
  documentFileNameBack: string | null;
  addressProofType: string | null;
  addressDocUrl: string | null;
  addressDocFileName: string | null;
  addressDocUrlBack: string | null;
  addressDocFileNameBack: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resubmitAfter: string | null;
  createdAt: string;
}

export interface WalletData {
  id: string;
  userId: string;
  balance: string;
  bonusBalance: string;
  frozen: string;
  currency: string;
}

export interface TransactionData {
  id: string;
  walletId: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "BONUS_CREDIT" | "BONUS_WITHDRAWAL" | "BONUS_TRANSFER" | "INTERNAL_TRANSFER_OUT" | "INTERNAL_TRANSFER_IN";
  amount: string;
  feeAmount?: string | null;
  payoutAmount?: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  description: string | null;
  screenshotUrl?: string | null;
  transactionId?: string | null;
  upiId?: string | null;
  currency?: string | null;
  processedBy?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

// ─── Fetch Wrapper ───
const REQUEST_TIMEOUT_MS = 20000;

function friendlyNetworkMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "Request timed out. Please check your connection and try again.";
  }
  if (err instanceof TypeError) {
    // Browser fetch throws a generic TypeError ("Failed to fetch" / "Load failed")
    // for DNS failures, offline state, CORS, and server-unreachable — none of that
    // detail survives, so we normalize it to one actionable message.
    return "Unable to reach the server. Please check your internet connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!isFormData && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${env.API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error(friendlyNetworkMessage(err));
  } finally {
    clearTimeout(timeoutId);
  }

  let data: Record<string, unknown> | null = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (HTML error page, empty body, proxy error, etc.)
    if (!res.ok) {
      const err = new Error(
        res.status >= 500
          ? "Server error. Please try again in a moment."
          : "Something went wrong. Please try again."
      );
      (err as unknown as Record<string, unknown>).status = res.status;
      throw err;
    }
    return {} as T;
  }

  if (!res.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      (res.status >= 500
        ? "Server error. Please try again in a moment."
        : "Something went wrong. Please try again.");
    const err = new Error(message);
    (err as unknown as Record<string, unknown>).status = res.status;
    throw err;
  }

  return data as T;
}

// ─── Auth API ───
export const authAPI = {
  register: (data: { name: string; email: string; password: string; ref?: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  logout: () =>
    request<ApiResponse>("/auth/logout", { method: "POST" }),

  sendOTP: (email: string) =>
    request<ApiResponse>("/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) }),

  verifyOTP: (email: string, otp: string) =>
    request<ApiResponse>("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),

  forgotPassword: (email: string) =>
    request<ApiResponse>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    request<ApiResponse>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),

  getMe: () =>
    request<{ user: User }>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<ApiResponse>("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }),

  deactivateAccount: () =>
    request<ApiResponse>("/auth/deactivate-account", { method: "POST" }),
};

export interface UsdPaymentInfo {
  method: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  bankName: string;
}

// ─── Wallet API ───
export const walletAPI = {
  getWallet: () =>
    request<{
      wallet: WalletData; upiId: string; usdPayment: UsdPaymentInfo;
      pendingRequest: TransactionData | null; pendingBonusRequest: TransactionData | null;
      currencyLocked: boolean;
      withdrawalSettings: { minWithdrawal: number; feeAmount: number };
    }>("/wallet"),

  getTransactions: () =>
    request<{ transactions: TransactionData[] }>("/wallet/transactions"),

  deposit: (amount: number, transactionId: string, screenshot: File) => {
    const fd = new FormData();
    fd.append("amount", String(amount));
    fd.append("transactionId", transactionId);
    fd.append("screenshot", screenshot);
    return request<{ message: string; transaction: TransactionData }>("/wallet/deposit", {
      method: "POST",
      body: fd,
      headers: {},
    });
  },

  withdraw: (amount: number, upiId: string) =>
    request<{ message: string; transaction: TransactionData }>("/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, upiId }),
    }),

  setCurrency: (currency: "USD") =>
    request<{ message: string; wallet: WalletData }>("/wallet/currency", {
      method: "POST",
      body: JSON.stringify({ currency }),
    }),

  transferBonusToWallet: (amount: number) =>
    request<{ message: string; transaction: TransactionData }>("/wallet/bonus/transfer", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  requestBonusWithdrawal: (amount: number, upiId: string) =>
    request<{ message: string; transaction: TransactionData }>("/wallet/bonus/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, upiId }),
    }),

  getTransactionHistory: (page: number, limit = 30, type?: "DEPOSIT" | "WITHDRAWAL" | "INDEX" | "BONUS") =>
    request<TransactionHistoryResponse>(
      `/wallet/transactions/history?page=${page}&limit=${limit}${type ? `&type=${type}` : ""}`
    ),
};

// ─── Internal Transfer ───
export interface TransferRecipient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  kycApproved: boolean;
}

export interface InternalTransfer {
  id: string;
  senderId: string;
  receiverId: string;
  sourceType: "WALLET" | "BONUS";
  amount: string;
  feePercent: string;
  feeAmount: string;
  netAmount: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  rejectReason: string | null;
  processedAt: string | null;
  createdAt: string;
  sender?: { id: string; name: string; email: string };
  receiver?: { id: string; name: string; email: string };
}

export const transferAPI = {
  searchRecipients: (q: string) =>
    request<{ users: TransferRecipient[] }>(`/transfer/search?q=${encodeURIComponent(q)}`),
  create: (data: { receiverId: string; sourceType: "WALLET" | "BONUS"; amount: number; note?: string }) =>
    request<{ message: string; transfer: InternalTransfer }>("/transfer", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMyTransfers: () => request<{ transfers: InternalTransfer[] }>("/transfer/my-transfers"),
};

export interface TransactionEvent {
  id: string;
  category: "WALLET" | "INDEX" | "BONUS";
  type: "DEPOSIT" | "WITHDRAWAL" | "INDEX_INVEST" | "INDEX_WITHDRAW" | "BONUS_CREDIT" | "BONUS_WITHDRAWAL" | "BONUS_TRANSFER" | "INTERNAL_TRANSFER_OUT" | "INTERNAL_TRANSFER_IN";
  amount: number | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  description: string | null;
  date: string;
  // Present on INDEX_INVEST / INDEX_WITHDRAW events — the fee taken and the
  // gross amount it was taken from, so the UI can show a "X - fee = Y" line.
  grossAmount?: number;
  feeAmount?: number;
  netAmount?: number | null;
}

export interface TransactionHistoryResponse {
  transactions: TransactionEvent[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── KYC API ───
export const kycAPI = {
  getStatus: () =>
    request<{ kyc: KycData }>("/kyc/status"),

  sendEmailOtp: () =>
    request<{ message: string }>("/kyc/email-otp", {
      method: "POST",
    }),

  verifyEmailOtp: (otp: string) =>
    request<{ message: string }>("/kyc/verify-email-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  submit: (formData: FormData) =>
    request<{ message: string; kyc: KycData }>("/kyc/submit", {
      method: "POST",
      body: formData,
      headers: {},
    }),
};

// ─── Referral Types ───
export interface ReferralCode {
  code: string;
  link: string;
}

export interface ReferralUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ReferralCommission {
  id: string;
  amount: string;
  percentage: string;
  status: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  status: string;
  registeredAt: string;
  kycAt: string | null;
  depositedAt: string | null;
  referred: ReferralUser;
  commissions: ReferralCommission[];
}

export interface ReferralStats {
  total: number;
  registered: number;
  kycDone: number;
  deposited: number;
  totalCommission: number;
}

export interface HierarchyItem {
  id: string;
  status: string;
  registeredAt: string;
  referred: ReferralUser;
  level: number;
  subReferrals?: HierarchyItem[];
}

// ─── Referral API ───
export type ReferralDashboardStats = {
  totalReferrals: number;
  registered: number;
  kycDone: number;
  deposited: number;
  totalCommission: number;
  commissionRate: number;
};

export interface ReferralEarningsBreakdown {
  byLevel: number[];
  monthlyTotals: { label: string; amount: number }[];
  totalEarned: number;
}

export const referralAPI = {
  getMyCode: () => request<ReferralCode>("/referral/my-code"),
  getMyReferrals: () => request<{ referrals: Referral[]; stats: ReferralStats }>("/referral/my-referrals"),
  getMyStats: () => request<{ stats: ReferralDashboardStats }>("/referral/stats"),
  getHierarchy: () => request<{ hierarchy: HierarchyItem[] }>("/referral/hierarchy"),
  getEarningsBreakdown: () => request<ReferralEarningsBreakdown>("/referral/earnings-breakdown"),
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
}

export interface IndexPriceEntry {
  price: number;
  changePercent: number;
  changeAmount: number;
  dateLabel: string;
  recordedAt: string;
}

export interface IndexManager {
  name: string;
  title: string;
  bio: string | null;
  imageUrl: string | null;
}

export interface IndexData {
  tiers: IndexTier[];
  activeTier: IndexTier | null;
  walletBalance: number;
  maintenanceFeePercent: number;
  earlyWithdrawalPercent: number;
  maturityWithdrawalFee: number;
  referralLevels: number[];
  priceHistory: IndexPriceEntry[];
  currentPrice: { price: number; changePercent: number; changeAmount: number };
  manager: IndexManager | null;
}

export interface IndexInvestment {
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
}

// ─── Index API ───
export const indexAPI = {
  getData: () => request<IndexData>("/index"),
  getMyInvestments: () => request<{ investments: IndexInvestment[] }>("/index/investments"),
  invest: (amount: number, tierId: string) =>
    request<{ message: string; investment: IndexInvestment }>("/index/invest", {
      method: "POST",
      body: JSON.stringify({ amount, tierId }),
    }),
  // investmentId identifies which of the user's (possibly several,
  // one-per-tier) ACTIVE investments to add funds to / withdraw.
  topUp: (amount: number, investmentId: string) =>
    request<{ message: string; investment: IndexInvestment }>("/index/top-up", {
      method: "POST",
      body: JSON.stringify({ amount, investmentId }),
    }),
  withdraw: (investmentId: string) =>
    request<{ message: string; payoutAmount: number; withdrawalFee: number; wasMature: boolean }>("/index/withdraw", {
      method: "POST",
      body: JSON.stringify({ investmentId }),
    }),
};

// ─── Support API ───
export type SupportCategory = "TECHNICAL" | "BILLING" | "KYC" | "ACCOUNT" | "OTHER";

export interface SupportTicket {
  id: string;
  userId: string;
  category: SupportCategory;
  subject: string;
  message: string;
  screenshotUrls: string[];
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const supportAPI = {
  createTicket: (data: { category: SupportCategory; subject: string; message: string; screenshots?: File[] }) => {
    const fd = new FormData();
    fd.append("category", data.category);
    fd.append("subject", data.subject);
    fd.append("message", data.message);
    (data.screenshots || []).forEach((file) => fd.append("screenshots", file));
    return request<{ message: string; ticket: SupportTicket }>("/support", {
      method: "POST",
      body: fd,
      headers: {},
    });
  },
  getMyTickets: () => request<{ tickets: SupportTicket[] }>("/support/my-tickets"),
};
