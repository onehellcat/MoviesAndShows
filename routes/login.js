const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const userdb = require("../userdb");

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  userdb.query(query, [username], async (err, results) => {
    if (err) {
      console.error("❗️" + err);
      return res.render("error", { errorMessage: "Internal server error" });
      //return res.sendStatus(500);
    }

    if (results.length === 0) {
      // Username not found
      return res.render("error", { errorMessage: "Invalid Username" });
      return res.status(401).send("Invalid username or password");
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Successful login
      req.session.userId = user.uuid;
      req.session.username = user.username;
      return res.redirect("/home");
    } else {
      // Incorrect password
      return res.render("error", { errorMessage: "Invalid Password" });
    }
  });
});

module.exports = router;
