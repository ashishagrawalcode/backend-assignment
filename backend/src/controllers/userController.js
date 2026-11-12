import bcrypt from "bcrypt";
import User from "../models/User.js";

// POST /api/users/register
export async function register(req, res) {
  const { name, email, password } = req.body;

  if (typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Enter a name, email, and password (at least 6 characters)" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const alreadyExists = await User.findOne({ email: cleanEmail });
  if (alreadyExists) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  // Never save a plain password. bcrypt turns it into a one-way hash.
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    // unique: true is enforced by MongoDB, including when two requests race.
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    throw error;
  }
}

// POST /api/users/login
export async function login(req, res) {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Password is excluded by default, so we ask for it explicitly here.
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Regenerate the session on login to avoid reusing an old session ID.
  req.session.regenerate((error) => {
    if (error) return res.status(500).json({ message: "Could not start a login session" });
    req.session.userId = user._id.toString();
    req.session.save((saveError) => {
      if (saveError) return res.status(500).json({ message: "Could not save the session" });
      res.json({
        message: "Login successful",
        user: { id: user._id, name: user.name, email: user.email },
      });
    });
  });
}

// GET /api/users/me
export async function getMe(req, res) {
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
}

// POST /api/users/logout
export function logout(req, res) {
  req.session.destroy((error) => {
    if (error) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
}
