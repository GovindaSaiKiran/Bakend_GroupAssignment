const express = require('express');
const db = require('./database/db');
const gamesRouter = require('./routes/games');
const guestsRouter = require('./routes/guests');
const bookingsRouter = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Basic health / welcome check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to BookNook Cafe Backend API',
    status: 'healthy'
  });
});

// Mount modular API routes
app.use('/games', gamesRouter);
app.use('/guests', guestsRouter);
app.use('/bookings', bookingsRouter);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handling middleware
// Ensures consistent JSON responses and prevents server crashes
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ message });
});

let server = null;

async function startServer(port = process.env.PORT || 3000) {
  try {
    await db.initDb();
    return new Promise((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`BookNook Cafe server is running on http://localhost:${port}`);
        resolve(server);
      });
      server.on('error', reject);
    });
  } catch (err) {
    console.error('Failed to initialize database or start server:', err);
    process.exit(1);
  }
}

// Start server automatically if executed directly
if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  closeServer: () => {
    return new Promise((resolve) => {
      if (server) {
        server.close(async () => {
          await db.close();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
};
