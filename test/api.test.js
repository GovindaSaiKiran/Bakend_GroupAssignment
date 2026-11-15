// Automated Test Suite for BookNook Cafe API
process.env.DB_FILE = ':memory:';
const assert = require('assert');
const { app, startServer, closeServer } = require('../src/server');

const PORT = 3999;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let serverInstance = null;

async function request(method, path, body = null) {
  const options = {
    method,
    headers: {}
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- Starting BookNook Cafe API Automated Verification ---');
  serverInstance = await startServer(PORT);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`\x1b[32m✔ PASS\x1b[0m : ${name}`);
      passed++;
    } catch (err) {
      console.error(`\x1b[31m✘ FAIL\x1b[0m : ${name}`);
      console.error(err);
      failed++;
    }
  }

  // 1. Root check
  await test('GET / returns healthy status', async () => {
    const res = await request('GET', '/');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });

  // 2. Games - GET all
  await test('GET /games returns array of seeded games', async () => {
    const res = await request('GET', '/games');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data));
    assert(res.data.length >= 1);
  });

  // 3. Games - POST valid game
  let createdGameId = null;
  await test('POST /games creates a new game (201)', async () => {
    const res = await request('POST', '/games', { name: 'Ticket to Ride', players: 5 });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.name, 'Ticket to Ride');
    assert.strictEqual(res.data.players, 5);
    assert(res.data.id > 0);
    createdGameId = res.data.id;
  });

  // 4. Games - POST validation tests
  await test('POST /games rejects missing name (400)', async () => {
    const res = await request('POST', '/games', { players: 4 });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Game name is required');
  });

  await test('POST /games rejects empty name (400)', async () => {
    const res = await request('POST', '/games', { name: '   ', players: 4 });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Game name is required');
  });

  await test('POST /games rejects invalid players <= 0 (400)', async () => {
    const res = await request('POST', '/games', { name: 'Checkers', players: -2 });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Players must be a positive number');
  });

  await test('POST /games rejects empty object (400)', async () => {
    const res = await request('POST', '/games', {});
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Game name is required');
  });

  // 5. Games - GET /games/:id
  await test('GET /games/:id returns game by id (200)', async () => {
    const res = await request('GET', `/games/${createdGameId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.id, createdGameId);
    assert.strictEqual(res.data.name, 'Ticket to Ride');
  });

  await test('GET /games/:id returns 404 for non-existent game', async () => {
    const res = await request('GET', '/games/99999');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.message, 'Game not found');
  });

  // 6. Games - PUT /games/:id
  await test('PUT /games/:id updates game (200)', async () => {
    const res = await request('PUT', `/games/${createdGameId}`, {
      name: 'Ticket to Ride Europe',
      players: 5
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.name, 'Ticket to Ride Europe');
  });

  await test('PUT /games/:id rejects invalid data (400)', async () => {
    const res = await request('PUT', `/games/${createdGameId}`, {
      name: '',
      players: 5
    });
    assert.strictEqual(res.status, 400);
  });

  await test('PUT /games/:id returns 404 for non-existent game', async () => {
    const res = await request('PUT', '/games/99999', {
      name: 'Non Existent',
      players: 2
    });
    assert.strictEqual(res.status, 404);
  });

  // 7. Search query parameter
  await test('GET /games?players=2 returns games with 2 players', async () => {
    const res = await request('GET', '/games?players=2');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data));
    assert(res.data.every((g) => g.players === 2));
  });

  await test('GET /games?name=chess returns matching games case-insensitively', async () => {
    const res = await request('GET', '/games?name=chess');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data));
    assert(res.data.some((g) => g.name.toLowerCase().includes('chess')));
  });

  await test('GET /games?players=invalid returns 400', async () => {
    const res = await request('GET', '/games?players=notanumber');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Players parameter must be a positive number');
  });

  // 8. Guests endpoints
  await test('GET /guests returns array of guests', async () => {
    const res = await request('GET', '/guests');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data));
    assert(res.data.length >= 1);
  });

  let createdGuestId = null;
  await test('POST /guests creates a new guest (201)', async () => {
    const res = await request('POST', '/guests', { name: 'Sarah' });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.name, 'Sarah');
    assert(res.data.id > 0);
    createdGuestId = res.data.id;
  });

  await test('POST /guests rejects empty name (400)', async () => {
    const res = await request('POST', '/guests', { name: '   ' });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Guest name is required');
  });

  await test('GET /guests/:id returns guest by id (200)', async () => {
    const res = await request('GET', `/guests/${createdGuestId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.name, 'Sarah');
  });

  await test('GET /guests/:id returns 404 for missing guest', async () => {
    const res = await request('GET', '/guests/99999');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.message, 'Guest not found');
  });

  // 9. Bookings - POST /bookings
  let bookingId1 = null;
  await test('POST /bookings creates a booking using guestName and gameName (201)', async () => {
    const res = await request('POST', '/bookings', {
      guestName: 'Rahul',
      gameName: 'Chess'
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.guestName, 'Rahul');
    assert.strictEqual(res.data.gameName, 'Chess');
    assert.strictEqual(res.data.returned, false);
    assert(res.data.id > 0);
    bookingId1 = res.data.id;
  });

  await test('POST /bookings rejects missing guestName (400)', async () => {
    const res = await request('POST', '/bookings', { gameName: 'Chess' });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Guest name is required');
  });

  await test('POST /bookings rejects missing gameName (400)', async () => {
    const res = await request('POST', '/bookings', { guestName: 'Rahul' });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, 'Game name is required');
  });

  await test('POST /bookings returns 404 for unknown guest', async () => {
    const res = await request('POST', '/bookings', {
      guestName: 'NonExistentGuest',
      gameName: 'Chess'
    });
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.message, 'Guest not found');
  });

  await test('POST /bookings returns 404 for unknown game', async () => {
    const res = await request('POST', '/bookings', {
      guestName: 'Rahul',
      gameName: 'NonExistentGame'
    });
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.message, 'Game not found');
  });

  // 10. Bookings - GET /bookings (SQL JOIN)
  await test('GET /bookings returns list with guestName and gameName via SQL JOIN', async () => {
    const res = await request('GET', '/bookings');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data));
    const booking = res.data.find((b) => b.id === bookingId1);
    assert(booking);
    assert.strictEqual(booking.guestName, 'Rahul');
    assert.strictEqual(booking.gameName, 'Chess');
    assert.strictEqual(booking.returned, false);
  });

  // 11. ⭐ SPECIAL GROUP TWIST — RETURN FLOW TESTS
  await test('Test 1: First return gives 200 OK', async () => {
    const res = await request('POST', `/bookings/${bookingId1}/return`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.message, 'Booking returned successfully');
    assert.strictEqual(res.data.bookingId, bookingId1);
  });

  await test('Test 2: Second return gives 409 Conflict with "Already returned"', async () => {
    const res = await request('POST', `/bookings/${bookingId1}/return`);
    assert.strictEqual(res.status, 409);
    assert.deepStrictEqual(res.data, { message: 'Already returned' });
  });

  await test('POST /bookings/:id/return gives 404 for non-existent booking', async () => {
    const res = await request('POST', '/bookings/99999/return');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.message, 'Booking not found');
  });

  // 12. ⭐ GUEST RETURN HISTORY
  await test('Test 3: GET /guests/:id/history returns returned booking', async () => {
    // Rahul's guest ID is 1 (seeded)
    const res = await request('GET', '/guests/1/history');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data));
    assert(res.data.length >= 1);
    const returnedRecord = res.data.find((h) => h.bookingId === bookingId1);
    assert(returnedRecord);
    assert.strictEqual(returnedRecord.guestName, 'Rahul');
    assert.strictEqual(returnedRecord.gameName, 'Chess');
    assert.strictEqual(returnedRecord.returned, true);
    assert(returnedRecord.returnDate);
  });

  await test('GET /guests/:id/history returns empty array when guest has no returned bookings', async () => {
    // Sarah (createdGuestId) has no bookings
    const res = await request('GET', `/guests/${createdGuestId}/history`);
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.data));
    assert.strictEqual(res.data.length, 0);
  });

  await test('GET /guests/:id/history returns 404 for non-existent guest', async () => {
    const res = await request('GET', '/guests/99999/history');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.message, 'Guest not found');
  });

  // 13. DELETE /games/:id
  await test('DELETE /games/:id deletes game (200)', async () => {
    const res = await request('DELETE', `/games/${createdGameId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.message, 'Game deleted successfully');

    // Confirm it is gone
    const verify = await request('GET', `/games/${createdGameId}`);
    assert.strictEqual(verify.status, 404);
  });

  await test('DELETE /games/:id returns 404 for non-existent game', async () => {
    const res = await request('DELETE', '/games/99999');
    assert.strictEqual(res.status, 404);
  });

  // 14. Unknown route 404 handler
  await test('Undefined route returns 404 JSON', async () => {
    const res = await request('GET', '/undefined-route-endpoint');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.message, 'Route not found');
  });

  console.log('\n--- Summary ---');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  await closeServer();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
