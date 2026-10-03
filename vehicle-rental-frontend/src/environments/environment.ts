// Production build. Point this at the deployed API Gateway (the ONLY backend URL the UI talks to).
// NOTE: the browser calls the gateway cross-origin here, so the gateway must allow CORS for the
// origin that serves this app (see README → "CORS").
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8090',
  razorpayScriptUrl: 'https://checkout.razorpay.com/v1/checkout.js',
};
