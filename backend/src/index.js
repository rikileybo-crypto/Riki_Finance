import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/auth.js';
import accountsRouter from './routes/accounts.js';
import syncRouter from './routes/sync.js';
import transactionsRouter from './routes/transactions.js';
import budgetRouter from './routes/budget.js';
import alertsRouter from './routes/alerts.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/accounts', requireAuth, accountsRouter);
app.use('/api/sync', requireAuth, syncRouter);
app.use('/api/transactions', requireAuth, transactionsRouter);
app.use('/api/budget', requireAuth, budgetRouter);
app.use('/api/alerts', requireAuth, alertsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(process.env.PORT || 3001, () =>
  console.log(`Backend running on port ${process.env.PORT || 3001}`)
);
