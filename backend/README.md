# Invoice Harmony — Backend API

Backend service for **Invoice Harmony**, a SaaS platform for managing invoices, payments, balances, earnings, analytics, and AI-assisted workflows.

This API provides authentication, customer management, invoice generation, payment tracking, reporting data, and system health monitoring.

---

# Overview

The backend is built using:

* **Node.js**
* **Express.js**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **Zod** (schema validation)

The architecture follows a **modular feature-based routing pattern**, where each feature manages its own routes and database interactions.

![Architecture Flow Chart](/backend.png)
---

# Core Responsibilities

The backend handles:

* User authentication and authorization
* Customer data management
* Invoice lifecycle management
* Payment recording
* Balance tracking
* Earnings calculations
* Dashboard analytics
* Settings management
* Profile management
* Health checks
* AI integration endpoints (chat + analytics)

---

# Project Structure

```
backend/
│
├── index.ts                # Server entry point
├── app.ts                  # Express app configuration
│
├── middleware/
│   ├── errorHandler.ts
│   └── auth.middleware.ts
│
├── routes/
│   ├── auth.routes.ts
│   ├── customer.routes.ts
│   ├── invoice.routes.ts
│   ├── payment.routes.ts
│   ├── profile.routes.ts
│   ├── settings.routes.ts
│   ├── health.routes.ts
│
├── validation/
│   └── zod-schemas.ts
│
├── prisma/
│   ├── prisma.ts           # Prisma client
│   └── schema.prisma       # Database schema
│
└── services/
    ├── analytics.service.ts
    ├── balance.service.ts
    ├── ai-chat.service.ts
```

---

# Application Flow

1. `index.ts` boots the server
2. `app.ts` initializes Express
3. Middleware is mounted:

   * Auth middleware
   * Error handler
4. Feature routes are registered
5. Requests are validated using Zod
6. Database operations are executed using Prisma
7. Responses are returned to the frontend

---

# API Modules

## Auth Module

Handles:

* Login
* Signup
* Token validation
* Session handling

Routes:

```
POST /auth/register
POST /auth/login
GET  /auth/me
```

---

## Customers Module

Handles customer records.

Routes:

```
GET    /customers
POST   /customers
GET    /customers/:id
PUT    /customers/:id
DELETE /customers/:id
```

---

## Invoices Module

Handles invoice creation and tracking.

Routes:

```
GET    /invoices
POST   /invoices
GET    /invoices/:id
PUT    /invoices/:id
DELETE /invoices/:id
```

---

## Payments Module

Handles payment records.

Routes:

```
GET    /payments
POST   /payments
GET    /payments/:id
```

---

## Dashboard Module

Provides analytics data such as:

* Revenue
* Outstanding balances
* Paid vs unpaid invoices
* Monthly earnings

Routes:

```
GET /dashboard/summary
GET /dashboard/analytics
```

---

## Settings Module

Handles:

* Business settings
* Tax settings
* Currency settings

Routes:

```
GET /settings
PUT /settings
```

---

## Profile Module

Handles:

* User profile data
* Account settings

Routes:

```
GET /profile
PUT /profile
```

---

## Health Module

Used for uptime monitoring.

Route:

```
GET /health
```

---

# Database Layer

Uses **Prisma ORM**.

```
Prisma Client → Database
```

Schema example:

```
User
Customer
Invoice
Payment
Settings
Profile
```

Each feature persists data via the Prisma client.

---

# Validation

All request bodies are validated using **Zod schemas**.

Example:

```
createInvoiceSchema
createCustomerSchema
paymentSchema
authSchema
```

Invalid requests return structured error responses.

---

# Middleware

## Auth Middleware

Validates:

* JWT tokens
* Session access

Protects:

```
/customers
/invoices
/payments
/settings
/profile
```

---

## Error Handler

Centralized error handling for:

* Validation errors
* Database errors
* Internal server errors

---

# AI Integration

Optional module supports:

* Invoice assistant
* Expense insights
* Financial summaries
* Chat-based help

Endpoints:

```
POST /ai/chat
POST /ai/analyze
```

---

# Environment Variables

```
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
AI_API_KEY=your_key
```

---

# Installation

```
git clone <repo>
cd backend
npm install
```

---

# Database Setup

```
npx prisma generate
npx prisma migrate dev
```

---

# Running the Server

Development:

```
npm run dev
```

Production:

```
npm run build
npm start
```

---

# Error Handling Format

Standard response:

```
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

---

# Logging

Supports:

* Request logs
* Error logs
* Performance logs

---

# Security

Includes:

* JWT authentication
* Route protection
* Input validation
* Rate limiting support
* Secure headers

---

# Deployment

Recommended:

* Docker
* Nginx reverse proxy
* PostgreSQL cloud database

---

# Future Improvements

Planned enhancements:

* Webhooks
* Multi-tenant isolation
* Role-based access control
* Background job queues
* Export reports (PDF / CSV)

---

# License

Private SaaS project — not for public redistribution.
