// Development build (ng serve). apiBaseUrl is empty so requests go to the dev server,
// which forwards /api/** and /bookings/** to the API Gateway via proxy.conf.json (no CORS needed).
export const environment = {
  production: false,
  apiBaseUrl: '',
  razorpayScriptUrl: 'https://checkout.razorpay.com/v1/checkout.js',
};
