const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
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

dotenv.config();

// Fix MongoDB SRV DNS resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
app.use(cors());
app.use(express.json());
<<<<<<< HEAD
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", require("./routes/users"));
app.use("/api/batches", require("./routes/batches"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/mentor", require("./routes/mentor"));
=======

app.use("/api/auth", authRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use( "/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions",submissionRoutes);
app.use("/api/announcements",announcementRoutes);
app.use("/api/users",userRoutes);
app.use( "/api/batches", batchRoutes);
>>>>>>> origin/main

app.get("/", (req, res) => {
  res.json({
    message: "Bootcamp Management System API is running",
  });
});

<<<<<<< HEAD
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
=======
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
>>>>>>> origin/main
});