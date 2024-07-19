const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const port = 3000;

// * Might be a feature in the future, use axios
//const pool = require("./newdb");

// -> Remove comment for logging
// ! app.use(morgan("dev"));
// ! -> Remove comment for logging
// ! Change the format if needed.
// ->
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

// # Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// # Use EJS as the template engine
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// # Session configuration
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false, // Change to false to avoid saving empty sessions
    cookie: { maxAge: 600000000000000 },
  })
);

// # Set up connect-flash middleware
app.use(flash());

// # Set up global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  next();
});

// # Middleware to log session data for debugging
app.use((req, res, next) => {
  // console.log("Session data:", req.session);
  next();
});

// # Root path route handler
app.get("/", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  res.redirect("/home");
});

// # Routes
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const homeRoute = require("./routes/home");
const movieRoute = require("./routes/movies");
const seriesRoute = require("./routes/series");
const dashboardRoute = require("./routes/dashboard");
const profileRoute = require("./routes/profile");
const watchRoute = require("./routes/wlater");

// # Routers
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/home", homeRoute);
app.use("/movies", movieRoute);
app.use("/series", seriesRoute);
app.use("/dashboard", dashboardRoute);
app.use("/profile", profileRoute);
app.use("/watchlater", watchRoute);

// * Test Routes
const testRouter = require("./testRoutes/testpage");
const testDashboard1 = require("./testRoutes/testpage1");
const testDashboard2 = require("./testRoutes/testpage2");
const testDashboard3 = require("./testRoutes/testpage3");
const testDashboard4 = require("./testRoutes/testpage4");

// * Test Routers
app.use("/test", testRouter);
app.use("/test1", testDashboard1);
app.use("/test2", testDashboard2);
app.use("/test3", testDashboard3);
app.use("/test4", testDashboard4);

// # Route to handle logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    } else {
      res.clearCookie("connect.sid");
      res.redirect("/login");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// #  Use trello more often, stop commenting
// #  I'm lazy here's a todo so do these:

// TODO: Try to use the same component for the movies and series list.
// NOTE: Make the pages responsive. Right now its garbage.
// NOTE: After using the same component, make the grid limited, use a pages instead. ( Might not be great)
// #
// TODO: Profile page
// NOTE: Edit profile , upload custom pfp . ( Password change might be late) ( Store pfp with the profile in the db)
// #
// TODO: Dashboard for telemetry
// NOTE: Data like how many movies and series is in the list, how many is in watchlater . How many seen/added in X time. Basic stuff like that
// #
// TODO: Home page
// NOTE: Maybe recommendation, upcoming, whats new
// #
// TODO: Fix the searchbar
// NOTE: Right now there's no autocomplete, so it basically works but only when you search the exact name.
// #
// TODO: Keep me Signed In
// NOTE: might be a good idea, maybe for developing only because it's annoying to login every time
