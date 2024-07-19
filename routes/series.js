// #
const express = require("express");
const router = express.Router();
const con = require("../listdb.js");

router.get("/", (req, res) => {
  // Check if user is authenticated
  if (!req.session.userId) {
    // Redirect to login if not authenticated
    return res.redirect("/login");
  }

  const userUUID = req.session.userId; // Retrieve userUUID from session

  // Fetch data from the database for the logged-in user
  con.query(
    "SELECT * FROM series WHERE userUUID = ? ORDER BY id ASC",
    [userUUID],
    (err, rows) => {
      if (err) {
        // Handle error and flash message
        req.flash("error", err);
        return res.render("series", {
          page_title: "Series",
          data: [],
          username: req.session.username,
        });
      }

      // Render the view with the fetched data
      res.render("series", {
        page_title: "Series",
        data: rows,
        username: req.session.username,
      });
    }
  );
});

router.post("/", (req, res) => {
  // Check if user is authenticated
  if (!req.session.userId) {
    // Redirect to login if not authenticated
    return res.redirect("/login");
  }

  const userUUID = req.session.userId; // Retrieve userUUID from session
  const { name, genres, imdb } = req.body;

  const query = `INSERT IGNORE INTO series (name, genre, IMDb, userUUID) VALUES (?, ?, ?, ?)`;
  con.query(query, [name, genres, imdb, userUUID], (err, results) => {
    if (err) {
      console.error(`Error adding to series: ${err.message}`);
      req.flash("error", err.message);
      return res.redirect("/series");
    }
    console.log(`Added to series: ${name} ${genres} ${imdb} by: ${userUUID}`);
    res.redirect("/series");
  });
});

module.exports = router;
