const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const errorHandler = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answerRoutes");
const commentRoutes = require("./routes/commentRoutes");
const topicRoutes = require("./routes/topicRoutes");
const likeRoutes = require("./routes/likeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app = express();
const clientBuildPath = path.join(__dirname, "..", "public");

app.use(express.json({ limit: "10mb" }));
app.use(helmet());
app.use(morgan("dev"));
let allowedOrigins = [];
try {
  const clientUrlEnv = process.env.CLIENT_URL || "";
  if (clientUrlEnv.startsWith("[")) {
    allowedOrigins = JSON.parse(clientUrlEnv);
  } else {
    // Fallback if they didn't use an array (e.g. "https://domain.com, http://localhost")
    allowedOrigins = clientUrlEnv.split(",").map(url => url.trim());
  }
  allowedOrigins = allowedOrigins.filter(Boolean);
} catch (error) {
  console.error("Failed to parse CLIENT_URL:", error);
}
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.get("/api", (req, res) => {
  res.status(200).send("Wisora API is running✈️.");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups", groupRoutes);

if (fs.existsSync(path.join(clientBuildPath, "index.html"))) {
  app.use(express.static(clientBuildPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).send("Wisora API is running.");
  });
}

app.use(errorHandler);

module.exports = app;
//done