import express from "express";
import session from "express-session";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

// Convert incoming JSON text into req.body.
app.use(express.json());

// Keep track of logged-in users using a local session cookie.
// The default in-memory session store is fine for this local class assignment,
// but should be replaced with a persistent store before production deployment.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 },
}));

app.get("/", (req, res) => {
  res.json({ message: "Backend API is running" });
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// If no route matches the URL, return 404.
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Express 5 sends errors from async controllers here automatically.
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.status && error.status < 500 ? error.message : "Something went wrong on the server",
  });
});

export default app;
