const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const attendanceRoutes = require( "./routes/attendanceRoutes");
const progressRoutes = require( "./routes/progressRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const announcementRoutes = require( "./routes/announcementRoutes");
const userRoutes = require( "./routes/userRoutes");
const batchRoutes = require("./routes/batchRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const studentRoutes = require("./routes/studentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

dotenv.config();

const app = express();

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const corsOptions = {
  origin: function (origin, callback) {
    // Reflect the request origin back to allow credentials without using '*'
    callback(null, origin || true);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use( "/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions",submissionRoutes);
app.use("/api/announcements",announcementRoutes);
app.use("/api/users",userRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Bootcamp Management System API is running",
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
