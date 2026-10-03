# DriveEasy – Vehicle Rental Frontend (Angular)

Angular 20 (standalone components, signals, lazy routes, Reactive Forms, functional guards/interceptors) frontend for the
Spring Boot microservices backend. The UI talks **only to the API Gateway** (port 8090) – never to Eureka or to individual service ports.

> **Status of verification – please read.** This was built in a sandbox with no internet access, so I could **not** run
> `npm install` / `ng build`, and I could **not** start the backend (no Maven dependencies, no MySQL).
> What *was* checked: every `.ts` file parses; the framework-free logic (error mapping, JWT decoding, rental-day maths) is
> type-checked under `strict` and covered by 20 passing tests using the real payload shapes from your controllers/exception handlers;
> every import, lazy route target and template dependency resolves. What was **not** checked: the Angular compiler/build,
> and any live end-to-end call. Run the steps below once and send me the first error, if any – see "First run checklist".

## Run it

**Backend** (start order): MySQL (`root` / password from each `application.properties`) → Eureka `:8761` → user `:8081`,
vehicle `:8082`, payment `:8083`, booking `:8084`, content `:8085` → API Gateway `:8090`.

**Frontend** (Node ≥ 20.19 or ≥ 22.12):

```bash
npm install
npm start            # http://localhost:4200  (dev proxy → http://localhost:8090)
npm run build        # production build → dist/vehicle-rental-frontend/browser
```

In dev, `apiBaseUrl` is empty and `proxy.conf.json` forwards `/api/**` and `/bookings/**` to the gateway, so **no CORS setup is needed**.
Change the gateway target in `proxy.conf.json` if it is not on `localhost:8090`.

**Admin account:** registration always creates role `USER`. To get the admin screens, promote a user in MySQL:
`UPDATE user_db.users SET role='ADMIN' WHERE email='you@example.com';` then sign in again.

### First run checklist
1. `npm start` compiles without errors.
2. Register → you land on the dashboard (auto sign-in).
3. As admin: add a vehicle (e.g. `KA01AB1234`) → it appears on Home / Vehicles.
4. Book it → confirmation page → **Pay** → Razorpay test checkout (test card from Razorpay docs) → "Payment successful".
5. My bookings → cancel a booking; Subscription → subscribe/unsubscribe; Account → delete.

## API mapping (taken from the controllers in your zip, via gateway)

| Frontend feature | Microservice | Method | Endpoint |
|---|---|---|---|
| Register | User | POST | `/api/users/register` |
| Login | User | POST | `/api/users/login` |
| Profile / dashboard | User | GET | `/api/users/{id}` |
| Edit profile | User | PUT | `/api/users/{id}` |
| Delete account | User | DELETE | `/api/users/{id}` |
| Subscribe | User | POST | `/api/users/{id}/subscribe` |
| Unsubscribe | User | DELETE | `/api/users/{id}/unsubscribe` |
| Admin: users list | User | GET | `/api/users` |
| Vehicle list | Vehicle | GET | `/api/vehicles` |
| Available vehicles | Vehicle | GET | `/api/vehicles/available` |
| Vehicle by type (filter) | Vehicle | GET | `/api/vehicles/type/{type}` |
| Vehicle details | Vehicle | GET | `/api/vehicles/{id}` |
| Admin: add / edit / delete vehicle | Vehicle | POST / PUT / DELETE | `/api/vehicles` , `/api/vehicles/{id}` |
| Create booking | Booking | POST | `/bookings` |
| Booking details / confirmation | Booking | GET | `/bookings/{bookingId}` |
| Booking history | Booking | GET | `/bookings/user/{userId}` |
| Cancel booking | Booking | PUT | `/bookings/{bookingId}/cancel` |
| Admin: all bookings | Booking | GET | `/bookings` |
| Payment (create Razorpay order) | Payment | POST | `/api/payments/create-order` |
| Payment verification / status screen | Payment | POST | `/api/payments/verify` |
| Reviews & feedback list | Content | GET | `/api/content` |
| Submit feedback | Content | POST | `/api/content` |
| Admin: delete entry | Content | DELETE | `/api/content/{id}` |

Deliberately **not** used: `PUT /api/users/{id}/password` (change password – you said it was removed, see findings),
`PUT /api/content/{id}`, and any "search vehicle" API (none exists – the brand/model box filters the loaded list in the browser).
There is no payment history/status read endpoint in the backend, so there is **no** payment-history page.

## Validation (mirrors the backend DTOs, so users get instant feedback)

| Form | Rules |
|---|---|
| Register | name 2–50 (not blank); email format; phone optional, exactly 10 digits; password ≥ 8; confirm must match |
| Login | email format; password required |
| Edit profile | name 2–50; phone 10 digits (email is read-only; the backend ignores blank values so a phone cannot be cleared) |
| Booking | vehicle required (available only); pickup ≥ today; return ≥ pickup; total = days × price (same-day = 1 day) |
| Vehicle (admin) | number `^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$` (auto-uppercased); brand/model 2–30; type required; price > 0; status AVAILABLE/BOOKED/MAINTENANCE |
| Feedback | type; name 2–50; email format; message 5–500; rating 1–5 |

Backend 400 field-error maps (`{field: message}`) are pushed onto the matching form control; other errors are mapped to friendly messages
(`Bad credentials` → "Invalid email or password.", 500s never leak stack/Feign text, network failure → "Unable to reach the server…").

## Structure

```
src/app/core        services (auth, user, vehicle, booking, payment, content, toast), guards, interceptors, models, utils
src/app/shared      navbar/footer/toasts, spinner, empty/error states, confirm dialog, vehicle card, field-error, validators
src/app/features    auth · users · vehicles · bookings · payments · content · home · admin   (lazy-loaded route files)
src/environments    apiBaseUrl (gateway) – dev uses the proxy, production uses http://localhost:8090 (edit for your host)
```

Browser routes use `/my-bookings` and `/book` (not `/bookings`) on purpose: `/bookings/**` is a **gateway path**, and with the dev proxy a page
reload on `/bookings` would be forwarded to the backend instead of Angular.

## Production / CORS

A production build calls the gateway cross-origin, and **the gateway currently has no CORS configuration**. Either serve the built app
and the gateway from the same origin (reverse proxy), or add CORS to the gateway. Untested sketch for `api-gateway` `SecurityConfig`:

```java
http.cors(Customizer.withDefaults()).csrf(csrf -> csrf.disable()).authorizeHttpRequests(a -> a.anyRequest().permitAll());

@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("https://your-frontend-host"));
    c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    c.setAllowedHeaders(List.of("Authorization","Content-Type"));
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
}
```

## Findings in the backend (not changed – for your decision)

1. **Change Password is still in the zip** (`PUT /api/users/{id}/password`, `PasswordRequest`, `changePassword`) although you described it as removed. The UI does not use it.
2. **No authorization on most endpoints.** Only user-service checks the JWT, and only for "is authenticated". Any signed-in user can delete/subscribe *any* user id,
   update any profile, and anyone (even signed-out) can add/edit/delete vehicles, list all bookings, cancel any booking, and delete content, because vehicle/booking/content/payment/gateway
   are `permitAll`/unsecured. The frontend hides admin screens and blocks viewing other users' bookings, but that is UX only – it is **not** security. Enforce roles/ownership in the services.
3. **Client-supplied `totalAmount`.** The booking total is computed in the browser and trusted by the server. Compute it server-side from the vehicle price × days.
4. **Payment and booking are not linked after payment.** Verify marks the payment `SUCCESS` but the booking status stays `CONFIRMED` and the vehicle never becomes `BOOKED`; there is no endpoint to read payment status.
   The pay page therefore relies on the backend's "Payment already completed" error to detect a paid booking.
5. **Booking creation is not transactional with the payment order** (booking is saved, then the Payment call may fail → 500 with the booking already stored). The UI warns the user to check *My Bookings* before retrying.
6. Login returns `token/email/role` but no user id; the UI reads the `userId` claim from the JWT.
7. `Booking` JSON uses `bookingId`, while the create response (`BookingResponse`) uses `id` – the models reflect this.
8. **Secrets are committed** in `application.properties` (MySQL password, JWT secret, Razorpay key secret). Rotate them and move to environment variables.
9. The API mapping was derived from the controller source, not from a live `/v3/api-docs` (backend could not be started here). Your services expose docs at `/api-docs`, aggregated at the gateway `/swagger-ui.html`.
