# BookNook Cafe – Backend Development

## Group Assignment – LG-07

**BookNook Cafe** is a backend application developed as part of the Backend Development Fundamentals group assignment.

The project is designed for a board-game café where guests can book games, view available games, and return booked games. The backend provides REST APIs using **Node.js, Express.js, and SQLite**.

The project also implements the special **Return Flow** requirement where a booking can be returned only once. If the same booking is returned again, the API returns a `409 Conflict` response with the message `"Already returned"`.

---

## Group Details

### Group ID

**LG-07**

### Team Members

| S. No. | Name | Student ID |
|---|---|---|
| 1 | M. Lokesh Reddy | 252U1R8055 |
| 2 | M. Durga Swaroop | 252U1R8057 |
| 3 | Sk Md. Rihan | 252U1R8087 |
| 4 | Sk. Venkata Yasin | 252U1R8088 |
| 5 | T. Govinda Sai Kiran | 252U1R8092 |

---

# 1. Project Objective

The main objective of this project is to develop a RESTful backend system for managing a board-game café.

The system provides APIs for:

- Managing guests
- Managing board games
- Creating bookings
- Viewing bookings
- Searching games
- Validating user input
- Returning booked games
- Preventing duplicate returns
- Viewing a guest's returned-game history

The project uses a SQLite database to store the application data permanently.

---

# 2. Technologies Used

- **Node.js**
- **Express.js**
- **SQLite**
- **JavaScript**
- **REST API**
- **Postman**
- **Git & GitHub**

---

# 3. Project Structure

```text
BookNook-Cafe/
│
├── src/
│   ├── server.js
│   │
│   ├── database/
│   │   ├── db.js
│   │   └── schema.sql
│   │
│   └── routes/
│       ├── games.js
│       ├── guests.js
│       └── bookings.js
│
├── test/
│   └── api.test.js
│
├── postman/
│   └── BookNook-Cafe.postman_collection.json
│
├── package.json
├── .gitignore
└── README.md
```

---

# 4. Database Design

The application uses SQLite with three main tables:

```text
guests
games
bookings
```

The relationship between the tables is:

```text
Guests
   │
   │ guest_id
   ▼
Bookings
   ▲
   │ game_id
   │
Games
```

## Guests Table

Stores information about café guests.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| name | TEXT | Guest name |

---

## Games Table

Stores the available board games.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| name | TEXT | Name of the game |
| players | INTEGER | Number of players |

---

## Bookings Table

Stores bookings made by guests.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| guest_id | INTEGER | Foreign key to guests |
| game_id | INTEGER | Foreign key to games |
| returned | INTEGER | Return status |
| return_date | TEXT | Date/time when returned |

The `bookings` table connects guests and games using foreign keys.

---

# 5. Features Implemented

## 5.1 Guest Management

The API supports:

- Create a guest
- View all guests
- View a guest by ID
- View a guest's returned booking history

---

## 5.2 Game Management

Complete CRUD operations are implemented for games.

### Create

```http
POST /games
```

### Read All

```http
GET /games
```

### Read One

```http
GET /games/:id
```

### Update

```http
PUT /games/:id
```

### Delete

```http
DELETE /games/:id
```

---

## 5.3 Game Search

Games can be searched using query parameters.

Example:

```http
GET /games?players=2
```

This returns games that support two players.

Name search is also supported:

```http
GET /games?name=chess
```

---

## 5.4 Booking Management

A booking can be created using the guest name and game name.

Example:

```http
POST /bookings
```

Request body:

```json
{
  "guestName": "Rahul",
  "gameName": "Chess"
}
```

The backend checks whether the guest and game exist before creating the booking.

---

## 5.5 SQL JOIN

The booking endpoint uses SQL JOIN operations to display booking information together with the guest and game names.

Example:

```http
GET /bookings
```

Example response:

```json
[
  {
    "id": 1,
    "guestName": "Rahul",
    "gameName": "Chess",
    "returned": false
  }
]
```

---

# 6. Input Validation

Validation is implemented for add and update operations.

The API checks for invalid input such as:

- Missing game name
- Empty game name
- Invalid number of players
- Missing guest name
- Missing game name while creating a booking
- Invalid IDs
- Non-existing guests
- Non-existing games

Example invalid request:

```json
{
  "name": "",
  "players": -1
}
```

The API returns a `400 Bad Request` response with a clear error message.

---

# 7. HTTP Status Codes

The project uses appropriate HTTP status codes according to the result of the request.

| Status Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource successfully created |
| 400 | Invalid request or validation error |
| 404 | Resource not found |
| 409 | Conflict |
| 500 | Internal server error |

---

# 8. Special Requirement – Return Flow

The special requirement for our group is the **Return Flow**.

The endpoint is:

```http
POST /bookings/:id/return
```

When a booking is returned for the first time, it is marked as returned.

### First Return

```text
POST /bookings/1/return
```

Response:

```text
200 OK
```

Example:

```json
{
  "message": "Booking returned successfully",
  "bookingId": 1
}
```

---

## Second Return

If the same booking is returned again:

```text
POST /bookings/1/return
```

the API does not return `200` again.

Instead, it returns:

```text
409 Conflict
```

Response:

```json
{
  "message": "Already returned"
}
```

This prevents the same booking from being returned multiple times.

---

# 9. Guest Return History

The project also provides:

```http
GET /guests/:id/history
```

This endpoint displays the returned bookings of a particular guest.

Example:

```http
GET /guests/1/history
```

Example response:

```json
[
  {
    "bookingId": 1,
    "guestName": "Rahul",
    "gameName": "Chess",
    "returned": true,
    "returnDate": "2026-11-15T06:22:18.000Z"
  }
]
```

If the guest has no returned bookings, an empty array is returned.

---

# 10. API Endpoints

## Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check whether the API is running |

---

## Guests

| Method | Endpoint | Description |
|---|---|---|
| GET | `/guests` | Get all guests |
| GET | `/guests/:id` | Get a guest by ID |
| POST | `/guests` | Create a new guest |
| GET | `/guests/:id/history` | Get returned booking history |

---

## Games

| Method | Endpoint | Description |
|---|---|---|
| GET | `/games` | Get all games |
| GET | `/games/:id` | Get a game by ID |
| POST | `/games` | Create a new game |
| PUT | `/games/:id` | Update a game |
| DELETE | `/games/:id` | Delete a game |
| GET | `/games?players=2` | Search games by number of players |
| GET | `/games?name=chess` | Search games by name |

---

## Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookings` | Create a booking |
| GET | `/bookings` | Get bookings with guest and game names |
| POST | `/bookings/:id/return` | Return a booking |

---

# 11. Postman Testing

All API endpoints were tested using **Postman**.

The Postman collection is available in:

```text
postman/BookNook-Cafe.postman_collection.json
```

The following sections contain screenshots of the API tests performed in Postman.

---

## Test 1 – Server Health Check

### Request

```http
GET /
```

### Expected Result

```text
200 OK
```

The response confirms that the Express server is running successfully.

### Screenshot

> Add your Postman screenshot here.

```text
<img width="1917" height="1016" alt="image" src="https://github.com/user-attachments/assets/90cac88e-3fc1-402d-ba49-c3cc09886bcd" />

```

---

# 12. Guest API Testing

## Test 2 – Create Guest

### Request

```http
POST /guests
```

### Request Body

```json
{
  "name": "Rahul"
}
```

### Expected Result

```text
201 Created
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1018" alt="image" src="https://github.com/user-attachments/assets/b2b421de-1d32-4a66-9d6c-aafb046ad09a" />

```

---

## Test 3 – Get All Guests

### Request

```http
GET /guests
```

### Expected Result

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1011" alt="image" src="https://github.com/user-attachments/assets/53697f15-4254-4058-a0ce-b63ab9fb10de" />

```

---

## Test 4 – Get Guest by ID

### Request

```http
GET /guests/1
```

### Expected Result

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1021" alt="image" src="https://github.com/user-attachments/assets/964e2bfc-2877-44c7-a4e4-1daf695d1ff5" />

```

---

# 13. Game CRUD Testing

## Test 5 – Create Game

### Request

```http
POST /games
```

### Request Body

```json
{
  "name": "Chess",
  "players": 2
}
```

### Expected Result

```text
201 Created
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/83fce54e-bf7a-4952-a58a-e6678563e6f0" />

```

---

## Test 6 – Get All Games

### Request

```http
GET /games
```

### Expected Result

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/56c37ef7-ad5b-4346-b989-75d88c0e17b3" />

```

---

## Test 7 – Get Game by ID

### Request

```http
GET /games/1
```

### Expected Result

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1020" alt="image" src="https://github.com/user-attachments/assets/38d0fc3c-6474-4203-95e0-396052f5808c" />

```

---

## Test 8 – Update Game

### Request

```http
PUT /games/1
```

### Request Body

```json
{
  "name": "Chess",
  "players": 2
}
```

### Expected Result

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/d8bcf6e4-26b4-4e44-88ab-6553f062062b" />

```

---

## Test 9 – Delete Game

### Request

```http
DELETE /games/2
```

### Expected Result

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1018" alt="image" src="https://github.com/user-attachments/assets/f4769e4f-665b-43ed-8ba2-6ac632d6f767" />

```

---

# 14. Search Testing

## Test 10 – Search Games by Players

### Request

```http
GET /games?players=2
```

### Expected Result

The API should return games that support 2 players.

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1022" alt="image" src="https://github.com/user-attachments/assets/bfc84e21-21b9-474e-af19-85e2635315fe" />

```

---

## Test 11 – Search Games by Name

### Request

```http
GET /games?name=chess
```

### Expected Result

The API should return matching games.

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1021" alt="image" src="https://github.com/user-attachments/assets/8bc10656-4b21-4982-8b75-44cb7190f085" />

```

---

# 15. Validation Testing

## Test 12 – Invalid Game Data

### Request

```http
POST /games
```

### Request Body

```json
{}
```

### Expected Result

```text
400 Bad Request
```

with a clear validation message.

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/ef16547f-30d3-4734-8d2f-cc629d739f76" />

```

---

## Test 13 – Invalid Players

### Request

```http
POST /games
```

### Request Body

```json
{
  "name": "Test Game",
  "players": -1
}
```

### Expected Result

```text
400 Bad Request
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/712a5d8f-c9a5-45e0-af76-753a6f6e233c" />

```

---

# 16. Booking Testing

## Test 14 – Create Booking

### Request

```http
POST /bookings
```

### Request Body

```json
{
  "guestName": "Rahul",
  "gameName": "Chess"
}
```

### Expected Result

```text
201 Created
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1020" alt="image" src="https://github.com/user-attachments/assets/72d6af96-8293-4c29-9c57-b91abfedefcb" />

```

---

## Test 15 – Get Bookings with JOIN

### Request

```http
GET /bookings
```

### Expected Result

The response should contain:

- Booking ID
- Guest name
- Game name
- Return status

```text
200 OK
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1017" alt="image" src="https://github.com/user-attachments/assets/401a68c9-e87f-40a9-b357-d0b0fe430f84" />

```

---

# 17. Return Flow Testing

This is the special requirement implemented by our group.

## Test 16 – First Return

### Request

```http
POST /bookings/1/return
```

### Expected Result

```text
200 OK
```

Example response:

```json
{
  "message": "Booking returned successfully",
  "bookingId": 1
}
```

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="985" alt="image" src="https://github.com/user-attachments/assets/9e936be7-0bef-49f1-83d7-7acaa6d61f56" />

```

---

## Test 17 – Return the Same Booking Again

The same request is sent again:

```http
POST /bookings/1/return
```

### Expected Result

```text
409 Conflict
```

Response:

```json
{
  "message": "Already returned"
}
```

This confirms that the system prevents a booking from being returned more than once.

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1005" alt="image" src="https://github.com/user-attachments/assets/dcbd619b-637a-4d79-8825-d6e89c2e8014" />

```

---

# 18. Guest History Testing

## Test 18 – Get Guest Return History

### Request

```http
GET /guests/1/history
```

### Expected Result

```text
200 OK
```

The returned booking should be displayed in the guest's history.

### Screenshot

> Add Postman screenshot here.

```text
<img width="1917" height="1020" alt="image" src="https://github.com/user-attachments/assets/dba352b2-6d92-487c-9cdc-d106df5ac518" />

```

---

# 19. Return Flow Summary

The complete Return Flow works as follows:

```text
Create Booking
      │
      ▼
POST /bookings/:id/return
      │
      ▼
First Return
      │
      ▼
200 OK
      │
      ▼
Booking marked as returned
      │
      ▼
Same Return Request
      │
      ▼
409 Conflict
      │
      ▼
"Already returned"
      │
      ▼
GET /guests/:id/history
      │
      ▼
Returned booking displayed
```

---

# 20. Project Task Distribution

The project work is divided into five major task areas for the five group members.

| Member | Student ID | Assigned Task |
|---|---|---|
| M. Lokesh Reddy | 252U1R8055 | Guest Management and Guest APIs |
| M. Durga Swaroop | 252U1R8057 | Games CRUD and Game Search |
| Sk Md. Rihan | 252U1R8087 | SQLite Database and Database Relationships |
| Sk. Venkata Yasin | 252U1R8088 | Booking APIs, Validation and SQL JOIN |
| T. Govinda Sai Kiran | 252U1R8092 | Return Flow, Guest History, Integration, Testing and Documentation |

### Task 1 – Guest Management

**Assigned to:** M. Lokesh Reddy

Work area:

- Guest table requirements
- Guest creation
- Get all guests
- Get guest by ID
- Guest-related API handling

---

### Task 2 – Games CRUD and Search

**Assigned to:** M. Durga Swaroop

Work area:

- Game creation
- Get all games
- Get game by ID
- Update game
- Delete game
- Search games using query parameters

---

### Task 3 – Database

**Assigned to:** Sk Md. Rihan

Work area:

- SQLite setup
- Database schema
- Guests table
- Games table
- Bookings table
- Primary keys
- Foreign keys
- Database relationships

---

### Task 4 – Bookings and Validation

**Assigned to:** Sk. Venkata Yasin

Work area:

- Booking creation
- Booking retrieval
- SQL JOIN
- Guest and game relationship
- Request validation
- Error handling
- Appropriate HTTP status codes

---

### Task 5 – Return Flow and Integration

**Assigned to:** T. Govinda Sai Kiran

Work area:

- Booking return endpoint
- First-return logic
- Duplicate return prevention
- `409 Conflict` handling
- Guest return history
- Integration of all backend modules
- API testing
- Postman collection
- README documentation

---

# 21. How to Run the Project

## Step 1 – Clone the Repository

```bash
git clone <repository-url>
```

Then move into the project folder:

```bash
cd BookNook-Cafe
```

---

## Step 2 – Install Dependencies

```bash
npm install
```

---

## Step 3 – Start the Server

```bash
npm start
```

The server runs at:

```text
http://localhost:3000
```

---

## Step 4 – Test Using Postman

Open Postman and import:

```text
postman/BookNook-Cafe.postman_collection.json
```

Then send the API requests described in the testing sections above.

---

# 22. Automated Testing

The project also contains an automated API test file:

```text
test/api.test.js
```

Run:

```bash
npm test
```

The test suite verifies:

- Server health
- Game CRUD
- Game validation
- Game search
- Guest APIs
- Booking creation
- Booking JOIN
- Return Flow
- Duplicate return handling
- Guest history
- 404 handling

The final test run completed successfully with:

```text
Passed: 35
Failed: 0
```

---

# 23. Conclusion

The BookNook Cafe backend provides the required REST APIs for managing guests, games, and bookings.

The project also implements the special Return Flow requirement:

```text
First Return  → 200 OK
Second Return → 409 Conflict
Guest History → Returned booking displayed
```

The backend was developed using Node.js, Express.js and SQLite, and the APIs were tested using Postman.

---

## Group

**LG-07**

### Team Members

- M. Lokesh Reddy – 252U1R8055
- M. Durga Swaroop – 252U1R8057
- Sk Md. Rihan – 252U1R8087
- Sk. Venkata Yasin – 252U1R8088
- T. Govinda Sai Kiran – 252U1R8092
