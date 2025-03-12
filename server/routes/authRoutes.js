const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Register Route
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });


    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});


// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const trimmedemail = req.body.email.split("@")[0];

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }  // Token expiration (30 days)
    );

    res.json({
      message: 'Login successful',
      token,  // Send the token to the client
      trimmedemail
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});



// Protected Route
router.get("/me", protect, async(req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }});

module.exports = router;
