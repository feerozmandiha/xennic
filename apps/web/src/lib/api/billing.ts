import { apiClient } from './client';

// ── Invoices ─────────────────────────────────────────────────────────────────

export function getInvoices(page = 1, limit = 20) {
  return apiClient.get<any>(`/billing/invoices?page=${page}&limit=${limit}`);
}

export function getInvoice(id: string) {
  return apiClient.get<any>(`/billing/invoices/${id}`);
}

export function createInvoice(data: { subtotal: number; totalAmount: number; taxAmount?: number; currency?: string }) {
  return apiClient.post<any>('/billing/invoices', data);
}

// ── Payments ─────────────────────────────────────────────────────────────────

export function getPayments(page = 1, limit = 20) {
  return apiClient.get<any>(`/billing/payments?page=${page}&limit=${limit}`);
}

export function createPayment(data: { invoiceId: string; gateway: string; amount: number }) {
  return apiClient.post<any>('/billing/payments', data);
}

export function requestGatewayPayment(data: { paymentId: string; callbackUrl: string }) {
  return apiClient.post<any>('/billing/payments/request', data);
}

export function verifyGatewayPayment(data: { authority: string; amount: number }) {
  return apiClient.post<any>('/billing/payments/verify', data);
}

// ── Transactions ─────────────────────────────────────────────────────────────

export function getTransactions(page = 1, limit = 20) {
  return apiClient.get<any>(`/billing/transactions?page=${page}&limit=${limit}`);
}

// ── Payment Methods ──────────────────────────────────────────────────────────

export function getPaymentMethods() {
  return apiClient.get<any>('/billing/payment-methods');
}

export function addPaymentMethod(data: {
  gateway: string;
  gatewayCustomerId?: string;
  maskedNumber?: string;
  cardHolderName?: string;
  isDefault?: boolean;
}) {
  return apiClient.post<any>('/billing/payment-methods', data);
}

export function deletePaymentMethod(id: string) {
  return apiClient.delete<any>(`/billing/payment-methods/${id}`);
}

export function setDefaultPaymentMethod(id: string) {
  return apiClient.post<any>(`/billing/payment-methods/${id}/default`, {});
}

// ── Subscription Payments ────────────────────────────────────────────────────

export function getSubscriptionPayments() {
  return apiClient.get<any>('/billing/subscription-payments');
}

export function processRenewal() {
  return apiClient.post<any>('/billing/subscription-payments/renew', {});
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export function getBillingDashboard() {
  return apiClient.get<any>('/billing/dashboard');
}
