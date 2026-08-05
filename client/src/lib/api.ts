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
  assignedRoleId: string | null;
  assignedRole: AssignedRole | null;
  theme: string | null;
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
  frozen: string;
  currency: string;
}

export interface TransactionData {
  id: string;
  walletId: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: string;
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

  const res = await fetch(`${env.API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong");
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
    request<{ wallet: WalletData; upiId: string; usdPayment: UsdPaymentInfo; pendingRequest: TransactionData | null; currencyLocked: boolean }>("/wallet"),

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
};

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
export const referralAPI = {
  getMyCode: () => request<ReferralCode>("/referral/my-code"),
  getMyReferrals: () => request<{ referrals: Referral[]; stats: ReferralStats }>("/referral/my-referrals"),
  getHierarchy: () => request<{ hierarchy: HierarchyItem[] }>("/referral/hierarchy"),
};
