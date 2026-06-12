const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.get('/', (req, res) => res.json({ message: 'Smart Student Learning & Placement API is alive' }));

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const server = app.listen(PORT, () => {
      console.log(`SSLPM API running on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Update PORT in backend/.env`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Server startup failed:', err.message);
    process.exit(1);
  }
};

startServer();