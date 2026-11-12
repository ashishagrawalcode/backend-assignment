# Backend Tutorial Assignment — Node.js, Express & MongoDB

A beginner-friendly implementation of the features in the [freeCodeCamp introduction to backend web development](https://www.youtube.com/watch?v=KOutPbKc9UM): MongoDB Atlas connection, user registration/login/logout, and CRUD APIs for posts. This is a separate learning project, not copied from the tutorial repository.

## What is included?

- Express server on port 4000
- MongoDB Atlas connection using Mongoose
- User and Post models
- Password hashing using bcrypt (plain passwords are not saved)
- Registration, login, logout and current-user endpoint
- Session cookies for real login/logout during local testing
- Post Create / Read / Update / Delete APIs
- Separate controller and route files
- Importable Postman collection

> **Classroom project, not production-ready.** `express-session` uses its in-memory session store here to keep the project easy to understand. Sessions disappear on restart, the store does not scale, and additional deployment protections (such as CSRF protection, HTTPS cookie configuration, rate limiting and a persistent session store) would be needed for public use.

## Folder structure

```text
backend-tutorial-assignment/
├── backend/
│   └── src/
│       ├── config/
│       │   └── database.js       # Connect MongoDB
│       ├── controllers/
│       │   ├── userController.js # Register, login, logout
│       │   └── postController.js # Create, read, update, delete
│       ├── middleware/
│       │   └── requireLogin.js   # Protect selected routes
│       ├── models/
│       │   ├── User.js           # User database structure
│       │   └── Post.js           # Post database structure
│       ├── routes/
│       │   ├── userRoutes.js     # URLs for user operations
│       │   └── postRoutes.js     # URLs for post operations
│       ├── app.js                # Express configuration
│       └── index.js              # Starts the application
├── postman/
│   └── Backend-Tutorial.postman_collection.json
├── .env.example                  # Template: copy to .env
├── .gitignore                    # Excludes passwords and packages
├── package.json                  # Packages and npm commands
└── README.md
```

## Setup on Windows

### 1) Install Node.js and VS Code

- Download the **LTS** Node.js version from https://nodejs.org
- Download VS Code from https://code.visualstudio.com
- Verify in a terminal: `node -v` and `npm -v`

### 2) Unzip and open the project

Unzip the downloaded ZIP, then open the **backend-tutorial-assignment** folder in VS Code (File → Open Folder). Choose **Terminal → New Terminal**.

### 3) Install libraries

From the project root (the folder containing package.json):

```powershell
npm install
```

This creates `node_modules` and `package-lock.json`. Do not put `node_modules` on GitHub.

### 4) Create a free MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register and register/login.
2. Create a project and a **free** cluster if offered in the interface.
3. Under **Database Access**, create a database user (this is **not** your Atlas website login). Save its username and password privately.
4. Under **Network Access**, allow your **current IP address**. If testing from different networks you may need to update this. Avoid wide-open access where possible.
5. Under **Database**, select your cluster → **Connect** → **Drivers** → **Node.js** and copy the `mongodb+srv://...` connection string.
6. Replace the `<username>` and `<password>` placeholders with your database user's credentials. Passwords with reserved URI characters must be URL-encoded.
7. Add `/backend_tutorial` as the database name in the connection string (before the `?` if one exists).

> Atlas screens may vary. Never share your database password in a public repository or screenshot.

### 5) Create `.env`

In the project root, make a copy of `.env.example` named `.env`. Edit its values:

```dotenv
PORT=4000
MONGODB_URI=mongodb+srv://YOUR_DB_USERNAME:YOUR_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/backend_tutorial?retryWrites=true&w=majority
SESSION_SECRET=type_a_long_random_private_string_here_at_least_32_chars
```

This file is **not** in the ZIP, because the correct credentials must come from **your** Atlas account. It is excluded from GitHub using `.gitignore`.

### 6) Run the project

```powershell
npm run dev
```

Expected terminal output after a successful Atlas connection:

```text
MongoDB connected successfully
Server running at http://localhost:4000
```

Now open http://localhost:4000 in your browser, expecting:

```json
{ "message": "Backend API is running" }
```

Keep this terminal running while sending Postman requests. Press **Ctrl+C** to stop.

## Test with Postman

Install Postman desktop from https://www.postman.com/downloads/ . Go to **Import → File** and import:

`postman/Backend-Tutorial.postman_collection.json`

The collection variable `baseUrl` is already set to `http://localhost:4000`. Postman normally saves the session cookie from **Login** automatically for the same host. Make sure the cookie jar is enabled and use `localhost` consistently (not a mixture of localhost and 127.0.0.1).

**Run these requests in this order:**

1. **Health Check** — `GET /` (no body)
2. **Register** — `POST /api/users/register` with JSON `{"name":"Student","email":"student@example.com","password":"pass1234"}` (expected 201)
3. **Login** — `POST /api/users/login` with JSON `{"email":"student@example.com","password":"pass1234"}` (expected 200; sets session cookie)
4. **Who Am I** — `GET /api/users/me` (expected 200 while logged in)
5. **Create Post** — `POST /api/posts` with JSON `{"title":"My first post","content":"Learning backend development"}` (expected 201; saves post ID)
6. **Read All Posts** — `GET /api/posts` (expected 200)
7. **Read One Post** — `GET /api/posts/{{postId}}` (expected 200)
8. **Update Post** — `PUT /api/posts/{{postId}}` with JSON `{"title":"Updated post title"}` (expected 200)
9. **Delete Post** — `DELETE /api/posts/{{postId}}` (expected 200)
10. **Logout** — `POST /api/users/logout` (expected 200; ends session)
11. **Who Am I (after logout)** — `GET /api/users/me` (expected 401)

The Create Post request includes a Postman **post-response script** that automatically saves the post `_id` as the collection variable `postId` for the next requests. If necessary, manually copy the `_id` from the Create response.

If you register the same email again, the API returns **409 Conflict**. Either log in with it or use a new email. The app stores hashed passwords, never their plain-text versions.

## API reference

| Method | URL | Login required? | Description |
|---|---|---|---|
| GET | `/` | No | Check server |
| POST | `/api/users/register` | No | Create a user |
| POST | `/api/users/login` | No | Start login session |
| GET | `/api/users/me` | Yes | Read logged-in user |
| POST | `/api/users/logout` | Yes | End login session |
| POST | `/api/posts` | Yes | Create a post |
| GET | `/api/posts` | No | Read all posts |
| GET | `/api/posts/:id` | No | Read a single post |
| PUT | `/api/posts/:id` | Yes, post owner | Update a post |
| DELETE | `/api/posts/:id` | Yes, post owner | Delete a post |

### HTTP status codes to explain in evaluation

- **200 OK** — request worked.
- **201 Created** — new user or post saved.
- **400 Bad Request** — missing/invalid input.
- **401 Unauthorized** — not logged in or bad login credentials.
- **403 Forbidden** — logged in but not allowed to edit someone else's post.
- **404 Not Found** — missing post/route.
- **409 Conflict** — email already registered.
- **500 Internal Server Error** — unexpected server failure.

## Explain the request flow during viva

For `POST /api/posts`:

1. Postman sends a POST request to the Express app with a JSON body.
2. `express.json()` parses JSON into `req.body`.
3. `postRoutes.js` matches the URL and the POST method.
4. `requireLogin.js` verifies there is a logged-in session.
5. `postController.js` checks the title/content and calls `Post.create(...)`.
6. `Post.js` defines the MongoDB data structure, and Mongoose saves the new document.
7. Express returns a `201` response containing the created post.

### Terms to know

- **Node.js:** runs JavaScript without a browser.
- **Express:** framework for HTTP routes and middleware.
- **MongoDB:** document database for users and posts.
- **Mongoose:** connects Node code to MongoDB using schemas/models.
- **Schema:** declares document fields and their types.
- **Model:** Mongoose class used for database operations.
- **Route:** connects a URL + HTTP method to a function.
- **Controller:** contains the actual logic for a request.
- **Middleware:** function that runs before the controller (e.g. login check).
- **Session:** server-side login state tied to a browser/Postman cookie.
- **bcrypt hash:** one-way transform used for safer password storage.
- **CRUD:** Create, Read, Update, Delete.
- **`async` / `await`:** wait for database/password operations without blocking Node.js's event loop.

## Common errors

- **`npm` not found:** reinstall Node.js LTS, reopen the VS Code terminal.
- **Cannot find module:** run `npm install` in the project root.
- **Missing MONGODB_URI or SESSION_SECRET:** create `.env` beside `package.json` and fill both.
- **MongoDB authentication failed:** use the **database** user credentials (not Atlas login) and check URI encoding.
- **IP address not allowed:** add your current IP under Atlas Network Access.
- **Connection timeout:** check internet access, Atlas cluster status, network permissions and your URI.
- **401 on Create Post:** first run Login in the **same Postman cookie jar**.
- **409 on Register:** email already exists; use Login or a new email.
- **Route not found:** verify URL and method, including `/api/users` versus `/api/posts`.

## GitHub (last, only after everything works)

Once the server and all Postman APIs work, we'll initialize Git and create a **new public GitHub repository**. `.env` and `node_modules` must never be pushed.
