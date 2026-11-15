const express = require('express');
const router = express.Router();
const db = require('../database/db');

function isPositiveInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

// GET /guests
router.get('/', async (req, res, next) => {
  try {
    const guests = await db.all('SELECT id, name FROM guests ORDER BY id ASC');
    res.status(200).json(guests);
  } catch (err) {
    next(err);
  }
});

// GET /guests/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ message: 'Invalid guest ID' });
    }

    const guest = await db.get('SELECT id, name FROM guests WHERE id = ?', [id]);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.status(200).json(guest);
  } catch (err) {
    next(err);
  }
});

// POST /guests
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Guest name is required' });
    }

    const trimmedName = name.trim();
    const result = await db.run('INSERT INTO guests (name) VALUES (?)', [trimmedName]);

    res.status(201).json({
      id: result.lastID,
      name: trimmedName
    });
  } catch (err) {
    next(err);
  }
});

// GET /guests/:id/history (Requirement 11: Guest Return History)
router.get('/:id/history', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ message: 'Invalid guest ID' });
    }

    // Verify guest exists
    const guest = await db.get('SELECT id, name FROM guests WHERE id = ?', [id]);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Query returned bookings using SQL JOIN
    const sql = `
      SELECT
        b.id AS bookingId,
        g.name AS guestName,
        gm.name AS gameName,
        b.returned,
        b.return_date AS returnDate
      FROM bookings b
      JOIN guests g ON b.guest_id = g.id
      JOIN games gm ON b.game_id = gm.id
      WHERE b.guest_id = ? AND b.returned = 1
      ORDER BY b.return_date DESC, b.id DESC
    `;

    const rows = await db.all(sql, [id]);

    const history = rows.map((row) => ({
      bookingId: row.bookingId,
      guestName: row.guestName,
      gameName: row.gameName,
      returned: true,
      returnDate: row.returnDate
    }));

    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

