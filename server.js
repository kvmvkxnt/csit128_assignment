require("dotenv").config({ quiet: true });

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const apiRoutes = require("./src/routes/api");
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/admin");

const app = express();
const PORT = process.env.PORT || 3010;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// CSP allows 'unsafe-inline' for styles only, since pages use inline
// style="" attributes; scripts stay script-src 'self' (no inline JS anywhere).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

// Only enabled when a frontend is hosted on a different origin (e.g. a
// separate docker-compose service). Same-origin deployments need neither
// CORS nor extra config, so this stays a no-op unless CORS_ORIGIN is set.
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

const PAGES = [
  "index",
  "about",
  "services",
  "products",
  "team",
  "feedback",
  "contact",
  "news",
  "register",
  "login",
];
PAGES.forEach((page) => {
  app.get("/" + (page === "index" ? "" : page), (_req, res) => {
    res.sendFile(path.join(__dirname, "public", page + ".html"));
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Unknown API endpoint." });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Veyra Technologies site running at http://localhost:${PORT}`);
  });
}

module.exports = app;
