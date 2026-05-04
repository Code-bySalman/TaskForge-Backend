import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./utils/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔥 SIMPLE CORS (no blocking while debugging)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// 🔥 CONNECT DB (fail loudly if broken)
try {
  await connectDB();
  console.log("MongoDB connected successfully");
} catch (err) {
  console.error("MongoDB connection FAILED:", err.message);
  process.exit(1); // stop server if DB fails
}

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// ERROR HANDLER
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});