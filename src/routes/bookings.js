const express = require('express');
const router = express.Router();
const db = require('../database/db');

function isPositiveInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

// GET /bookings (Requirement 7: SQL JOIN endpoint)
router.get('/', async (req, res, next) => {
  try {
    const sql = `
      SELECT
        b.id,
        g.name AS guestName,
        gm.name AS gameName,
        b.returned,
        b.return_date AS returnDate
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN games gm ON b.game_id = gm.id
      ORDER BY b.id ASC
    `;

    const rows = await db.all(sql);
    const bookings = rows.map((row) => ({
      id: row.id,
      guestName: row.guestName,
      gameName: row.gameName,
      returned: Boolean(row.returned),
      returnDate: row.returnDate
    }));

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
});

// GET /bookings/:id (Get one booking with guest and game details)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const sql = `
      SELECT
        b.id,
        b.guest_id AS guestId,
        b.game_id AS gameId,
        g.name AS guestName,
        gm.name AS gameName,
        b.returned,
        b.return_date AS returnDate
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN games gm ON b.game_id = gm.id
      WHERE b.id = ?
    `;

    const row = await db.get(sql, [id]);
    if (!row) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      id: row.id,
      guestId: row.guestId,
      gameId: row.gameId,
      guestName: row.guestName,
      gameName: row.gameName,
      returned: Boolean(row.returned),
      returnDate: row.returnDate
    });
  } catch (err) {
    next(err);
  }
});

// POST /bookings (Requirement 6: Create booking by guestName and gameName)
router.post('/', async (req, res, next) => {
  try {
    const { guestName, gameName } = req.body;

    if (!guestName || typeof guestName !== 'string' || guestName.trim().length === 0) {
      return res.status(400).json({ message: 'Guest name is required' });
    }

    if (!gameName || typeof gameName !== 'string' || gameName.trim().length === 0) {
      return res.status(400).json({ message: 'Game name is required' });
    }

    const trimmedGuestName = guestName.trim();
    const trimmedGameName = gameName.trim();

    // Find the guest (case-insensitive)
    const guest = await db.get(
      'SELECT id, name FROM guests WHERE LOWER(name) = LOWER(?)',
      [trimmedGuestName]
    );
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Find the game (case-insensitive)
    const game = await db.get(
      'SELECT id, name FROM games WHERE LOWER(name) = LOWER(?)',
      [trimmedGameName]
    );
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const result = await db.run(
      'INSERT INTO bookings (guest_id, game_id, returned, return_date) VALUES (?, ?, 0, NULL)',
      [guest.id, game.id]
    );

    res.status(201).json({
      id: result.lastID,
      guestId: guest.id,
      gameId: game.id,
      guestName: guest.name,
      gameName: game.name,
      returned: false,
      returnDate: null
    });
  } catch (err) {
    next(err);
  }
});

// POST /bookings/:id/return (Requirement 10: Return Flow Twist)
router.post('/:id/return', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const booking = await db.get('SELECT id, returned FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if already returned
    if (booking.returned === 1) {
      return res.status(409).json({ message: 'Already returned' });
    }

    const returnTimestamp = new Date().toISOString();
    await db.run(
      'UPDATE bookings SET returned = 1, return_date = ? WHERE id = ?',
      [returnTimestamp, id]
    );

    res.status(200).json({
      message: 'Booking returned successfully',
      bookingId: Number(id)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

