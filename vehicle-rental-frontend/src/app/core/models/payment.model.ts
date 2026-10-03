/** POST /api/payments/create-order body. */
export interface PaymentOrderRequest {
  bookingId: number;
  amount: number;
}

/** payment-service `PaymentResponse`. `amount` is in rupees. */
export interface PaymentOrder {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

/** POST /api/payments/verify body. */
export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
