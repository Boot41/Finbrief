require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // Required to work with file paths

// Import your route files
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const comparingRoutes = require("./routes/comparingRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/compare", comparingRoutes);

// Serve static files from the React app's build directory (copied to ./public)
app.use(express.static(path.join(__dirname, "public")));

// Catch-all route for client-side routing support in React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

