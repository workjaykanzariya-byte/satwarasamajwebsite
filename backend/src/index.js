const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const occupancyRoutes = require('./routes/occupancyRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const meritRoutes = require('./routes/meritRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const auditRoutes = require('./routes/auditRoutes');
const mahadanRoutes = require('./routes/mahadanRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Serve static uploads
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_PATH || './uploads')));
app.use('/api/v1/uploads', express.static(path.resolve(process.env.UPLOAD_PATH || './uploads')));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', apiLimiter);

// Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Satvara Samaj Backend API is running smoothly.', timestamp: new Date() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/occupancy', occupancyRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/merit', meritRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/mahadan', mahadanRoutes);

const { checkAndDeallocateExpiredStays } = require('./controllers/studentController');

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Satvara Samaj Backend API listening on http://localhost:${PORT}`);

  // Run auto-deallocation check for expired stays on startup
  checkAndDeallocateExpiredStays().catch(err => console.error('Initial expiry check failed:', err));

  // Run background cron interval every 12 hours
  setInterval(() => {
    console.log('⏰ Running scheduled bed stay expiry check...');
    checkAndDeallocateExpiredStays().catch(err => console.error('Scheduled expiry check failed:', err));
  }, 12 * 60 * 60 * 1000);
});
