const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const app = express();
const port = 3000;
const morgan = require("morgan");
require("dotenv").config();

// * Future feature ( maybe )
// const pool = require("./newdb");
// const axios = require("axios");

// ! app.use(morgan("dev"));  -> Remove comment for logging
// * used formats for morgen
// ? combined
// * :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
// ? common
// * :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]
// ? dev
// * :method :url :status :response-time ms - :res[content-length]
// ? short
// * :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
// ? tiny
// * :method :url :status :res[content-length] - :response-time ms

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Use EJS as the template engine
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const homeRoute = require("./routes/home");
const movieRoute = require("./routes/movies");
const seriesRoute = require("./routes/series");
const dashboardRoute = require("./routes/dashboard");
const profileRouter = require("./routes/profile");

// Test Routes
const testRouter = require("./testRoutes/testpage");
const testDashboard1 = require("./testRoutes/testpage1");
const testDashboard2 = require("./testRoutes/testpage2");
const testDashboard3 = require("./testRoutes/testpage3");

// Root path route handler
app.get("/", (req, res) => {
  // Redirect to login if user is not authenticated
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  // Redirect to dashboard or any other authenticated route
  res.redirect("/home");
});

// Routers
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/home", homeRoute);
app.use("/movies", movieRoute);
app.use("/series", seriesRoute);
app.use("/dashboard", dashboardRoute);
app.use("/profile", profileRouter);

// Test Routers
app.use("/test", testRouter);
app.use("/test1", testDashboard1);
app.use("/test2", testDashboard2);
app.use("/test3", testDashboard3);

// Route to handle logout
app.get("/logout", (req, res) => {
  // Clear the session data (destroy the session)
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    } else {
      // Redirect the user to the home page or login page after logout
      res.redirect("/");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
