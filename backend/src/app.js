import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const app = express();

// More tolerant CORS in dev: accept localhost and 127.0.0.1 variants
function buildAllowedOrigins() {
  const allowed = new Set([env.APP_URL]);
  try {
    const u = new URL(env.APP_URL);
    if (u.hostname === 'localhost') {
      allowed.add(`${u.protocol}//127.0.0.1${u.port ? `:${u.port}` : ''}`);
    }
    if (u.hostname === '127.0.0.1') {
      allowed.add(`${u.protocol}//localhost${u.port ? `:${u.port}` : ''}`);
    }
  } catch {}
  return Array.from(allowed);
}

const allowedOrigins = buildAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('trust proxy', 1);

const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX * 6,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
