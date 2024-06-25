const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const hashPassword = require("../utils/passwordHash");
const { v4: uuidv4 } = require("uuid");
const userdb = require("../userdb");

router.get("/", (req, res) => {
  res.render("register");
});

router.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username already exists
    const [existingUsername] = await userdb
      .promise()
      .query("SELECT uuid FROM users WHERE username = ?", [username]);

    // Check if email already exists
    const [existingEmail] = await userdb
      .promise()
      .query("SELECT uuid FROM users WHERE email = ?", [email]);

    if (existingUsername.length > 0 && existingEmail.length > 0) {
      // Both username and email already exist
      return res
        .status(400)
        .send("User with the same username and email already exists.");
    } else if (existingUsername.length > 0) {
      // Username already exists
      return res.status(400).send("Username already in use");
    } else if (existingEmail.length > 0) {
      // Email already exists
      return res.status(400).send("Email already in use.");
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    const query =
      "INSERT INTO users (uuid, username, email, password) VALUES (?, ?, ?, ?)";
    userdb.query(
      query,
      [userId, username, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error("❗️" + err);
          res.sendStatus(500);
        } else {
          res.redirect("/login");
          console.log(`✅|USERNAME: ${username} | was created successfully!`);
        }
      }
    );
  } catch (error) {
    console.error("❗️" + error);
    res.sendStatus(500);
  }
});

module.exports = router;
