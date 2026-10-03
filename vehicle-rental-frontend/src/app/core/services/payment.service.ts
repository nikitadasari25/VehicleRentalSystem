import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentOrder, PaymentOrderRequest, PaymentVerificationRequest } from '../models';
import { API, apiUrl } from '../utils/api.config';

export interface CheckoutCallbacks {
  onSuccess: (response: PaymentVerificationRequest) => void;
  onFailure: (message: string) => void;
  onDismiss: () => void;
}

export interface CheckoutPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

/** payment-service endpoints (via gateway) + Razorpay Checkout loader. */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly zone = inject(NgZone);
  private readonly base = apiUrl(API.payments);
  private scriptPromise: Promise<void> | null = null;

  createOrder(request: PaymentOrderRequest): Observable<PaymentOrder> {
    return this.http.post<PaymentOrder>(`${this.base}/create-order`, request);
  }

  verify(request: PaymentVerificationRequest): Observable<string> {
    return this.http.post(`${this.base}/verify`, request, { responseType: 'text' });
  }

  /** Opens Razorpay Checkout for an order created by the backend. */
  async openCheckout(order: PaymentOrder, description: string, prefill: CheckoutPrefill, cb: CheckoutCallbacks): Promise<void> {
    await this.loadScript();
    const RazorpayCtor = (window as any).Razorpay;
    if (!RazorpayCtor) throw new Error('Payment gateway unavailable');

    const options = {
      key: order.keyId,
      amount: Math.round(order.amount * 100), // paise
      currency: order.currency,
      order_id: order.orderId,
      name: 'DriveEasy Vehicle Rental',
      description,
      prefill,
      theme: { color: '#2563eb' },
      handler: (res: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        this.zone.run(() =>
          cb.onSuccess({
            razorpayOrderId: res.razorpay_order_id,
            razorpayPaymentId: res.razorpay_payment_id,
            razorpaySignature: res.razorpay_signature,
          }),
        ),
      modal: { ondismiss: () => this.zone.run(() => cb.onDismiss()) },
    };

    const rzp = new RazorpayCtor(options);
    rzp.on('payment.failed', (r: { error?: { description?: string } }) =>
      this.zone.run(() => cb.onFailure(r?.error?.description || 'The payment could not be completed.')),
    );
    rzp.open();
  }

  private loadScript(): Promise<void> {
    if ((window as any).Razorpay) return Promise.resolve();
    if (!this.scriptPromise) {
      this.scriptPromise = new Promise<void>((resolve, reject) => {
        const el = document.createElement('script');
        el.src = environment.razorpayScriptUrl;
        el.async = true;
        el.onload = () => resolve();
        el.onerror = () => {
          this.scriptPromise = null;
          el.remove();
          reject(new Error('Could not load the payment gateway. Check your internet connection.'));
        };
        document.head.appendChild(el);
      });
    }
    return this.scriptPromise;
  }
}
