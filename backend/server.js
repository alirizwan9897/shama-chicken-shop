const express = require("express");
const cors = require("cors");
const usersRouter = require("./api/users");
const productsRouter = require("./api/products");
const app = express();
const allowedOrigins = new Set([
  "http://localhost:3000",
  "https://shama-chicken-shop.vercel.app",
]);
function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return /^https:\/\/shama-chicken-shop-[a-z0-9-]+\.vercel\.app$/i.test(origin);
}
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  })
);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);

if (require.main === module) {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}
module.exports = app;