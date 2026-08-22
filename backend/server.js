const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

// Fix MongoDB SRV DNS resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
app.use(cors());
app.use(express.json());
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

app.get("/", (req, res) => {
  res.json({
    message: "Bootcamp Management System API is running",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});