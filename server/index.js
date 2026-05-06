const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const migrate = require('./src/db/migrate');

const app = express();

// Trust proxy for Railway deployments
app.set('trust proxy', 1);

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/projects/:projectId/tasks', require('./src/routes/tasks'));
app.use('/api/dashboard', require('./src/routes/dashboard'));

// Serve static frontend build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await migrate();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();