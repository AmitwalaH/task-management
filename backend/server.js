const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");

const app = express();

app.use(cors({
  origin: "https://task-management-henna-alpha.vercel.app/login"
}));

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes); // Login, Register
app.use("/api/projects", projectRoutes); // Project CRUD
app.use("/api/tasks", taskRoutes); // Task CRUD
app.use("/api/users", userRoutes); // User profile

app.get("/", (req, res) => {
  res.json({ message: "Task Management API is running!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
