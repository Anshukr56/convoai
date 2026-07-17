require("dotenv").config({ override: true });

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected "))
  .catch((err) => console.log(err));

// =======================
// Signup API
// =======================
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({ message: "Signup Successful" });
  } catch (error) {
    res.status(500).json({ message: "Signup Error" });
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login Successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login Error" });
  }
});

// Gemini Chat API (Direct REST API)
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(" My API Key is: ->" + apiKey + "<-");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // This will log the exact API error to your terminal
      console.log("Direct API Error Details:", JSON.stringify(data, null, 2));
      return res
        .status(400)
        .json({ reply: "Google API rejected the request." });
    }

    const reply = data.candidates[0].content.parts[0].text;

    res.json({ reply });
  } catch (error) {
    console.log("Server Error:", error);
    res.status(500).json({ reply: "API Error ⚠️" });
  }
});

// Default Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
