import { Injectable } from '@nestjs/common';
import type {
  IPaymentGateway,
  PaymentRequest,
  PaymentResponse,
  PaymentVerification,
} from './payment-gateway.interface.js';

interface ZarinpalConfig {
  merchantId: string;
  sandbox: boolean;
}

@Injectable()
export class ZarinpalGateway implements IPaymentGateway {
  readonly name = 'zarinpal';

  private readonly baseUrl: string;
  private readonly merchantId: string;

  constructor() {
    const config: ZarinpalConfig = {
      merchantId: process.env.ZARINPAL_MERCHANT_ID ?? 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      sandbox: process.env.ZARINPAL_SANDBOX === 'true',
    };
    this.merchantId = config.merchantId;
    this.baseUrl = config.sandbox
      ? 'https://sandbox.zarinpal.com/pg/v4/payment'
      : 'https://api.zarinpal.com/pg/v4/payment';
  }

  async requestPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const body = {
        merchant_id: this.merchantId,
        amount: request.amount,
        currency: request.currency === 'IRT' ? 'IRT' : 'IRR',
        description: request.description,
        callback_url: request.callbackUrl,
        metadata: {
          ...request.metadata,
          mobile: request.customerPhone,
          email: request.customerEmail,
          order_id: request.orderId,
        },
      };

      const response = await fetch(`${this.baseUrl}/request.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json() as any;

      if (data.data && data.data.code === 100) {
        const authority = data.data.authority;
        const sandboxPrefix = process.env.ZARINPAL_SANDBOX === 'true' ? 'sandbox.' : '';
        return {
          success: true,
          authority,
          redirectUrl: `https://${sandboxPrefix}zarinpal.com/pg/StartPay/${authority}`,
        };
      }

      return {
        success: false,
        authority: '',
        message: data.errors?.message ?? 'Zarinpal request failed',
      };
    } catch (err) {
      return {
        success: false,
        authority: '',
        message: `Zarinpal connection error: ${(err as Error).message}`,
      };
    }
  }

  async verifyPayment(authority: string, amount: number): Promise<PaymentVerification> {
    try {
      const body = {
        merchant_id: this.merchantId,
        authority,
        amount,
      };

      const response = await fetch(`${this.baseUrl}/verify.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json() as any;

      if (data.data && data.data.code === 100) {
        return {
          success: true,
          referenceId: data.data.ref_id,
          cardNumber: data.data.card_pan,
          amount: Number(data.data.amount),
          message: 'Payment verified successfully',
        };
      }

      return {
        success: false,
        referenceId: '',
        message: data.errors?.message ?? 'Verification failed',
      };
    } catch (err) {
      return {
        success: false,
        referenceId: '',
        message: `Zarinpal verification error: ${(err as Error).message}`,
      };
    }
  }
}
