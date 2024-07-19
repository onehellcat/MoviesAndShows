const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const userdb = require("../userdb");

// Render the login page
router.get("/", (req, res) => {
  res.render("login");
});

// Handle login form submission
router.post("/", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  userdb.query(query, [username], async (err, results) => {
    if (err) {
      console.error("❗️" + err);
      return res.render("error", { errorMessage: "Internal server error" });
    }

    if (results.length === 0) {
      return res.render("error", { errorMessage: "Invalid Username" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      req.session.userId = user.uuid;
      req.session.username = user.username;
      req.session.email = user.email;

      // Uncomment the line below for debugging session data
      // console.log("Login successful, session data:", req.session);

      return res.redirect("/home");
    } else {
      return res.render("error", { errorMessage: "Invalid Password" });
    }
  });
});

module.exports = router;
