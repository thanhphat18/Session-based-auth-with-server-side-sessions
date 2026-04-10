// ─────────────────────────────────────────────
// server.js  –  The Entry Point of your backend
// ─────────────────────────────────────────────
// Think of this file as the "front door" of your
// server. Every request comes through here first.

import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "../routes/auth.js";

dotenv.config(); // Load variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ─────────────────────────────────
// Middleware = code that runs on EVERY request before
// it reaches your route handlers.

// 1. Allow requests from your React frontend (different port = different "origin")
app.use(
  cors({
    origin: "http://localhost:5173", // Vite's default port
    credentials: true,              // Allow cookies/sessions to be sent
  })
);

// 2. Parse incoming JSON request bodies
//    Without this, req.body would be undefined
app.use(express.json());

// ── SESSION SETUP ──────────────────────────────
// A "session" is like a temporary locker at the server.
// When a user logs in, we put their info in the locker
// and give them a key (a cookie). On every request,
// they show their key and we know who they are.

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Used to sign/encrypt the cookie
    resave: false,           // Don't re-save session if nothing changed
    saveUninitialized: false, // Don't create session until data is stored
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Store sessions in MongoDB (not RAM)
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Cookie lasts 1 day (in milliseconds)
      httpOnly: true,  // JS in browser cannot access this cookie (security)
      secure: false,   // Set to true in production (requires HTTPS)
    },
  })
);

// ── ROUTES ─────────────────────────────────────
// Tell Express: "anything starting with /api/auth
// should be handled by authRoutes"
app.use("/api/auth", authRoutes);

// ── MONGODB CONNECTION ─────────────────────────
// Connect to your MongoDB database, THEN start server.
// We wait for DB connection first — no point accepting
// requests if we can't store/retrieve data.

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Stop the app if DB fails
  });