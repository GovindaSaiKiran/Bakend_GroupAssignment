const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Helper to validate positive integer
function isPositiveInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

// GET /games (with query param search for players and name)
router.get('/', async (req, res, next) => {
  try {
    const { players, name } = req.query;
    let query = 'SELECT id, name, players FROM games';
    const params = [];
    const conditions = [];

    if (players !== undefined) {
      if (!isPositiveInteger(players)) {
        return res.status(400).json({ message: 'Players parameter must be a positive number' });
      }
      conditions.push('players = ?');
      params.push(Number(players));
    }

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (trimmedName.length === 0) {
        return res.status(400).json({ message: 'Name parameter cannot be empty' });
      }
      conditions.push('LOWER(name) LIKE LOWER(?)');
      params.push(`%${trimmedName}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    const games = await db.all(query, params);
    res.status(200).json(games);
  } catch (err) {
    next(err);
  }
});

// GET /games/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const game = await db.get('SELECT id, name, players FROM games WHERE id = ?', [id]);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
});

// POST /games
router.post('/', async (req, res, next) => {
  try {
    const { name, players } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Game name is required' });
    }

    if (players === undefined || !isPositiveInteger(players)) {
      return res.status(400).json({ message: 'Players must be a positive number' });
    }

    const trimmedName = name.trim();
    const playerCount = Number(players);

    const result = await db.run(
      'INSERT INTO games (name, players) VALUES (?, ?)',
      [trimmedName, playerCount]
    );

    res.status(201).json({
      id: result.lastID,
      name: trimmedName,
      players: playerCount
    });
  } catch (err) {
    next(err);
  }
});

// PUT /games/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const existing = await db.get('SELECT id FROM games WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const { name, players } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Game name is required' });
    }

    if (players === undefined || !isPositiveInteger(players)) {
      return res.status(400).json({ message: 'Players must be a positive number' });
    }

    const trimmedName = name.trim();
    const playerCount = Number(players);

    await db.run(
      'UPDATE games SET name = ?, players = ? WHERE id = ?',
      [trimmedName, playerCount, id]
    );

    res.status(200).json({
      id: Number(id),
      name: trimmedName,
      players: playerCount
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /games/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ message: 'Invalid game ID' });
    }

    const existing = await db.get('SELECT id FROM games WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Game not found' });
    }

    await db.run('DELETE FROM games WHERE id = ?', [id]);

    res.status(200).json({ message: 'Game deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

