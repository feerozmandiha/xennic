export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  orderId: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  success: boolean;
  authority: string;
  redirectUrl?: string;
  message?: string;
}

export interface PaymentVerification {
  success: boolean;
  referenceId: string;
  transactionId?: string;
  cardNumber?: string;
  amount?: number;
  message?: string;
}

export interface IPaymentGateway {
  readonly name: string;
  requestPayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(authority: string, amount: number): Promise<PaymentVerification>;
}
