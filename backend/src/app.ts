import express from 'express';
import { authRouter } from './features/auth/auth.routes.js';
import { customerRouter } from './features/customer/customer.routes.js';
import { dashboardRouter } from './features/dashboard/dashboard.routes.js';
import { healthRouter } from './features/health/health.routes.js';
import { paymentRouter } from './features/payment/payment.routes.js';
import { invoiceRouter } from './features/invoice/invoice.routes.js';
import { profileRouter } from './features/profile/profile.routes.js';
import { settingsRouter } from './features/settings/settings.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

import cors from 'cors';

const app = express();

app.use(cors());
// Built-in middleware for json
app.use(express.json());

// Feature routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customerRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/health', healthRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/profile', profileRouter);
app.use('/api/settings', settingsRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
