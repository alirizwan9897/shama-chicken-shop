const express = require("express");
const cors = require("cors");

const usersRouter = require("./api/users");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://shama-chicken-shop.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  })
);

app.use("/api/users", usersRouter);

module.exports = app;