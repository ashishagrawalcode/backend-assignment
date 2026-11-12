# Study guide — explain this backend without memorizing blindly

The code is organized like this:

**Postman → Express route → Middleware → Controller → Mongoose model → MongoDB → JSON response**

## 1. A few JavaScript ideas

```js
const name = "Student";
```
`const` creates a variable you do not plan to reassign; `name` is its variable name, and `"Student"` is a string.

```js
function sayHello() { console.log("Hello"); }
```
A function groups instructions. `sayHello()` calls it.

```js
const { email, password } = req.body;
```
**Destructuring** extracts named fields from an object. Same idea as `const email = req.body.email; const password = req.body.password;`.

```js
export default User;
import User from "../models/User.js";
```
`export` makes something available to another JavaScript file, and `import` brings it into that file. We use **ES modules** because `package.json` contains `"type": "module"`.

```js
const user = await User.findOne({ email });
```
`await` pauses this async function while the database operation completes. It does not freeze the whole server. A function using `await` needs to be `async`.

## 2. What happens when Node.js starts?

1. You type `npm run dev`. npm finds the `dev` script in `package.json`.
2. Nodemon starts `backend/src/index.js` and watches for changed files.
3. `dotenv/config` reads the private `.env` file into `process.env`.
4. `index.js` calls `connectDB()` in `config/database.js`.
5. `mongoose.connect(MONGODB_URI)` connects to MongoDB Atlas.
6. `app.listen(4000)` starts listening for requests on port 4000.
7. Now Postman can send requests to `http://localhost:4000`.

**Key vocabulary:** `localhost` means this same computer; a **port** is a numbered entry point on the computer. The backend is usually called a **server** because it listens and responds to client requests.

## 3. Why do we need app.js?

`app.js` creates and configures the Express application:

- `express()` creates our app.
- `app.use(express.json())` parses JSON request bodies and puts the result in `req.body`.
- `app.use(session(...))` enables login sessions.
- `app.get("/", ...)` responds to the health-check request.
- `app.use("/api/users", userRoutes)` attaches user-related URLs.
- `app.use("/api/posts", postRoutes)` attaches post-related URLs.
- The final handlers return 404 for missing URLs and 500 for unexpected failures.

`app.listen()` lives in `index.js`, keeping server startup separate from routing.

## 4. Route versus controller

A **route** says which function to call for a particular HTTP method and path:

```js
router.post("/", requireLogin, createPost);
```

Read it: "For a POST request to `/api/posts`, first check login, then execute `createPost`." `requireLogin` is **middleware**. If the user isn't logged in, it sends 401 and does not call `next()`; if logged in, it calls `next()`.

A **controller** defines what to do: read `req.body`, validate fields, ask Mongoose to save or retrieve documents, and call `res.json(...)` to return JSON.

- `req` = the **incoming request** (body, URL parameters, cookies/session).
- `res` = the **response** you send back to Postman.
- `req.body` = parsed JSON body.
- `req.params.id` = the ID extracted from `/:id`.
- `res.status(201)` = set status to 201 Created.
- `res.json({ message: "OK" })` = send a JSON object.

## 5. How MongoDB data is represented

`models/User.js` describes users: `name`, `email`, and a **hashed** `password`.

`models/Post.js` describes posts: `title`, `content`, and `author`.

A **schema** defines fields and their types; a **model** gives methods such as:

- `User.create(...)`: **create** a new user.
- `User.findOne(...)`: **read** one matching user.
- `Post.find()`: **read** all posts.
- `Post.findById(id)`: **read** a specific post.
- `post.save()`: **update/save** changes.
- `post.deleteOne()`: **delete** a post.

The author is a MongoDB `ObjectId` that references a user. Mongoose's `.populate("author", "name email")` optionally replaces that reference with selected user details when reading posts.

MongoDB automatically assigns every saved document a unique `_id`.

## 6. Authentication and security (simplified for class)

**Register:** Receive a name, email and password → check valid input → check whether email exists → hash password using bcrypt → save user → respond 201.

**Login:** Find user by email → compare submitted password to its stored bcrypt hash → create a session on success → send the session cookie back to Postman.

**Who am I:** Read the logged-in user ID from the session → find the user → return their public details.

**Logout:** Destroy the session on the server and clear the cookie. Trying `/api/users/me` afterwards should return 401.

The session ID is kept in a cookie; the actual user ID is kept server-side. The session store is **in memory** for this local learning project, so a server restart logs everyone out. It is **not suitable for production deployment** as written.

## 7. CRUD in plain English

| Operation | HTTP method | Mongoose action | Example |
|---|---|---|---|
| Create | `POST` | `Post.create()` | Publish a new post |
| Read | `GET` | `Post.find()` | List the saved posts |
| Update | `PUT` | `post.save()` | Change a post title |
| Delete | `DELETE` | `post.deleteOne()` | Remove a post |

For the update and delete routes, we first compare the post's `author` with the logged-in `userId`. A different user gets a **403 Forbidden** response.

## 8. JSON and Postman

JSON is a way to represent data as key-value pairs:

```json
{
  "title": "My first post",
  "content": "Learning Node.js"
}
```

Postman sends this JSON in the **request body** of a `POST` request. It sets `Content-Type: application/json` so Express understands the format. The backend sends a JSON **response** (along with an HTTP status code).

For most requests, **GET** has no body. For `POST` and `PUT`, choose Body → raw → JSON.

## 9. Practice viva questions

1. **What is a backend?** Server-side logic that handles requests, rules, and data.
2. **What is Node.js?** A JavaScript runtime outside the browser.
3. **Why use Express?** It simplifies HTTP servers and routes.
4. **What is npm?** Package manager; installs dependencies listed in `package.json`.
5. **What is package.json?** Project metadata, scripts, dependency list.
6. **What is MongoDB Atlas?** MongoDB database hosted in the cloud.
7. **What does Mongoose do?** Defines schemas/models and performs MongoDB operations.
8. **What is an API endpoint?** An HTTP method + URL, such as `GET /api/posts`.
9. **What is a route?** Connects a URL and method to a handler.
10. **What is a controller?** The function with the actual request-handling logic.
11. **What is middleware?** Code that runs between receiving a request and the final handler.
12. **What is CRUD?** Create, Read, Update, Delete.
13. **What is req.body?** Parsed request-body data.
14. **What is req.params.id?** The `id` part of the URL, for example `/api/posts/123`.
15. **Why does the API return 201?** A new resource was created.
16. **What does 401 mean?** Authentication is missing or invalid.
17. **What does 403 mean?** You're authenticated but not allowed to perform this action.
18. **Why hash passwords?** To avoid saving plain-text passwords.
19. **Does logout work?** Yes. It deletes this classroom project's server session.
20. **Why `.env`?** To keep private configuration separate from source code.
21. **Why `.gitignore`?** So private credentials and downloaded packages are not committed.
22. **What does `async` / `await` do?** Simplifies code that waits for asynchronous operations.
23. **What is Postman?** A client for sending HTTP requests and inspecting results.
24. **What is `localhost:4000`?** The API on this computer, listening on TCP port 4000.
25. **How does a post relate to a user?** Its author field references the user's MongoDB ObjectId.

## 10. Important limitations to mention confidently

This is a local educational API. The default session store is in memory. There is no browser frontend and no production deployment setup. For production, we would add a persistent session store, HTTPS with appropriate secure cookie settings, CSRF protection (for browser clients), rate limits, strict request validation, monitoring and other operational safeguards.
