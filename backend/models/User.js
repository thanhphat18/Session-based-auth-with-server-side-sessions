// ─────────────────────────────────────────────
// models/User.js  –  The User "Blueprint"
// ─────────────────────────────────────────────
// A Mongoose model defines what a user document
// looks like in MongoDB. Think of it like a form:
// every user must have these exact fields.

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// ── SCHEMA ─────────────────────────────────────
// Schema = the structure/rules for each user document
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,           // No two users can have the same username
      trim: true,             // Removes accidental spaces: "  john  " → "john"
      minlength: [3, "Username must be at least 3 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,        // Always store email in lowercase
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // We will NEVER store the real password — only a "hash"
      // A hash is a scrambled version that can't be reversed
    },
  },
  {
    // Automatically adds "createdAt" and "updatedAt" timestamps
    timestamps: true,
  }
);

// ── PRE-SAVE HOOK ──────────────────────────────
// This code runs automatically BEFORE saving a user to the DB.
// It hashes (scrambles) the password so we never store it as plain text.
//
// Example: "mypassword123" → "$2b$10$X9....(unreadable hash)"
//
// Why? If your database is ever hacked, attackers can't read passwords.

userSchema.pre("save", async function (next) {
  // "this" refers to the user document being saved

  // Only hash the password if it was just set or changed.
  // (Prevents double-hashing if user updates their email, for example)
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 10; // Higher = more secure but slower. 10 is standard.
    this.password = await bcrypt.hash(this.password, saltRounds);
    next(); // Continue saving
  } catch (err) {
    next(err); // Pass error to Express error handler
  }
});

// ── INSTANCE METHOD ────────────────────────────
// This is a custom method we add to every User document.
// We can call it like: user.comparePassword("enteredPassword")
// It compares what the user typed with the stored hash.

userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare returns true if they match, false if not
  return bcrypt.compare(candidatePassword, this.password);
};

// ── EXPORT ────────────────────────────────────
// Create the model from the schema and export it.
// "User" becomes the MongoDB collection name "users" (auto-pluralized).
const User = mongoose.model("User", userSchema);
export default User;