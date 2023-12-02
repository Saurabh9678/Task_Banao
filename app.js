const express = require("express");
const errorMiddleware = require("./middleware/error");

const app = express();

app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Request-Headers", "https");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-api-key"
  );
  next();
});

const userRoutes = require("./Routes/userRoutes");
const postRoutes = require("./Routes/postRoutes");
const commentRoutes = require("./Routes/commentRoutes");

//Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/comment", commentRoutes);

// MiddleWare for Error

app.use(errorMiddleware);

module.exports = app;
