# Invoice Harmony — Frontend SPA

Frontend interface for **Invoice Harmony**, a SaaS platform for managing invoices, balances, payments, analytics, and AI-driven financial assistance.

This application provides a modern dashboard-based user interface.

---

# Overview

The frontend is built using:

* **React**
* **TypeScript**
* **React Router**
* **Context API**
* **Axios / Fetch HTTP client**

Architecture follows a **layout-driven SPA pattern**.

---

# Core Responsibilities

Frontend handles:

* User authentication UI
* Dashboard visualization
* Invoice management
* Customer management
* Payments tracking
* Reports display
* Settings management
* Sidebar navigation
* AI chat interface

---

# Project Structure
![Architecture Flow Chart](/frontend.png)

```
frontend/
│
├── main.tsx                # Application entry
├── App.tsx                 # Router shell
│
├── layouts/
│   └── AppLayout.tsx
│
├── components/
│   ├── AppSidebar.tsx
│   └── ProtectedRoute.tsx
│
├── pages/
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── Customers.tsx
│   ├── Invoices.tsx
│   ├── Payments.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│
├── context/
│   └── AuthContext.tsx
│
├── services/
│   └── api.service.ts
```

---

# Application Flow

1. `main.tsx` boots the app
2. `App.tsx` defines routing
3. `ProtectedRoute` checks authentication
4. `AppLayout` loads UI layout
5. Sidebar controls navigation
6. Pages call backend APIs
7. UI updates dynamically

---

# Routing Flow

Public route:

```
/auth
```

Protected routes:

```
/dashboard
/customers
/invoices
/payments
/reports
/settings
```

Authentication is validated before loading protected pages.

---

# Layout System

## AppLayout

Main UI shell:

Contains:

* Sidebar navigation
* Header area
* Page content container

---

## Sidebar Navigation

Provides links to:

```
Dashboard
Customers
Invoices
Payments
Reports
Settings
AI Chat
```

---

# Pages

## Auth Page

Handles:

* Login
* Registration

File:

```
Auth.tsx
```

---

## Dashboard Page

Displays:

* Revenue overview
* Outstanding balances
* Payment trends

File:

```
Dashboard.tsx
```

---

## Customers Page

Manages:

* Customer list
* Customer details

File:

```
Customers.tsx
```

---

## Invoices Page

Manages:

* Invoice creation
* Invoice editing
* Invoice tracking

File:

```
Invoices.tsx
```

---

## Payments Page

Tracks:

* Incoming payments
* Payment history

File:

```
Payments.tsx
```

---

## Reports Page

Displays:

* Earnings reports
* Monthly summaries
* Financial analytics

File:

```
Reports.tsx
```

---

## Settings Page

Allows:

* Profile settings
* Business settings
* Preferences

File:

```
Settings.tsx
```

---

# Authentication Flow

Uses **AuthContext**.

Responsibilities:

* Store user session
* Handle login/logout
* Protect routes

---

# API Communication

All requests pass through:

```
api.service.ts
```

Handles:

* Base URL config
* Token injection
* Error handling

Example:

```
GET /customers
POST /invoices
GET /dashboard/summary
```

---

# State Management

Uses:

```
React Context API
```

Stores:

* Auth state
* User session
* Token

---

# Environment Variables

```
VITE_API_URL=http://localhost:5000
```

---

# Installation

```
git clone <repo>
cd frontend
npm install
```

---

# Running Development Server

```
npm run dev
```

---

# Production Build

```
npm run build
```

---

# UI Features

Includes:

* Sidebar navigation
* Protected routing
* Dashboard analytics
* Real-time API updates
* Responsive layout
* AI assistant panel

---

# Error Handling

Standard API error responses are displayed using:

* Toast notifications
* Inline messages

---

# Security

Includes:

* Token-based authentication
* Route guards
* Session validation

---

# Deployment

Recommended:

* Vercel
* Netlify
* Docker-based hosting

---

# Future Improvements

Planned:

* Dark mode
* Export invoices
* Real-time notifications
* AI financial insights
* Offline caching

---

# License

Private SaaS project — not for public redistribution.
