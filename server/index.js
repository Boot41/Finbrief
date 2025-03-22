const fs = require('fs');
const path = require('path');
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Determine the correct .env file location.
// In development, .env is expected in the same directory as index.js.
// In production (as per your Dockerfile), .env is located in a subfolder named "server".
let envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  envPath = path.join(__dirname, 'server', '.env');
}

// Load environment variables from the determined .env file.
require('dotenv').config({ path: envPath });

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

const publicPath = path.join(__dirname, "public");
// Serve static files from the React app's build directory (copied to ./public)
app.use(express.static(publicPath));

// Catch-all route for client-side routing support in React
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


