// ─────────────────────────────────────────────
// routes/auth.js  –  Authentication Endpoints
// ─────────────────────────────────────────────
// A "route" is a URL path + what to do when hit.
// Example: POST /api/auth/register → create a new user
//
// Each route receives a Request (req) and Response (res).
//   req = what the client sent (body, session, params...)
//   res = what we send back (JSON, status codes...)

import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/register", (_req, res) => {
  res.status(405).json({
    message: "Use POST /api/auth/register to create an account.",
  });
});

router.get("/login", (_req, res) => {
  res.status(405).json({
    message: "Use POST /api/auth/login to sign in.",
  });
});

// ──────────────────────────────────────────────
// 📌 ROUTE 1: REGISTER
// POST /api/auth/register
// Creates a new user account
// ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    // 1. Pull data from the request body
    //    (what the frontend sent via the registration form)
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    // 2. Basic validation — make sure all fields exist
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 3. Check if email is already taken
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // 4. Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    // 5. Create the new user
    //    The password gets hashed automatically via our pre-save hook in User.js
    const newUser = new User({ username, email, password });
    await newUser.save(); // Save to MongoDB

    // 6. Automatically log them in by creating a session
    //    req.session is our "locker" — we store the user's ID there
    req.session.userId = newUser._id;
    await req.session.save();

    // 7. Send back success (never send password back!)
    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === 11000) {
      const duplicatedField = Object.keys(err.keyPattern || {})[0];
      return res.status(409).json({
        message: `${duplicatedField} already exists`,
      });
    }

    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0];
      return res.status(400).json({
        message: firstError?.message || "Invalid registration data",
      });
    }

    res.status(500).json({
      message: "Server error during registration",
      error: err.message,
    });
  }
});

// ──────────────────────────────────────────────
// 📌 ROUTE 2: LOGIN
// POST /api/auth/login
// Verifies credentials and creates a session
// ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    console.log("Login payload:", {
      email,
      passwordType: typeof password,
      passwordLength: typeof password === "string" ? password.length : null,
    });

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user by email
    //    If not found, return a vague message (don't reveal "email not found"
    //    as that helps attackers know which emails are registered)
    const user = await User.findOne({ email });
    console.log("Login user found:", Boolean(user));
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Compare the entered password against the stored hash
    //    using our custom comparePassword method from User.js
    const isMatch = await user.comparePassword(password);
    console.log("Login password match:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Create session — store user ID in the session locker
    req.session.userId = user._id;
    await req.session.save();

    // 5. Respond with user data (no password!)
    res.json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Server error during login",
      error: err.message,
    });
  }
});

// ──────────────────────────────────────────────
// 📌 ROUTE 3: LOGOUT
// POST /api/auth/logout
// Destroys the session (clears the locker)
// ──────────────────────────────────────────────
router.post("/logout", (req, res) => {
  // req.session.destroy() deletes the session from MongoDB
  // The browser's cookie becomes invalid after this
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid"); // Clear the session cookie from the browser
    res.json({ message: "Logged out successfully" });
  });
});

// ──────────────────────────────────────────────
// 📌 ROUTE 4: CHECK SESSION
// GET /api/auth/me
// Checks if the user is currently logged in
// ──────────────────────────────────────────────
// This is used when the React app first loads —
// we ask "hey server, is there already a logged-in session?"
// and the server checks the cookie the browser sends automatically.

router.get("/me", async (req, res) => {
  try {
    // If there's no userId in the session, nobody is logged in
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Fetch user from DB using the stored session ID
    // .select("-password") means: return everything EXCEPT password
    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // User is authenticated — send their data
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Session check error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
