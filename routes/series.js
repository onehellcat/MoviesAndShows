const express = require("express");
const router = express.Router();
const connection = require("../listdb.js");

router.get("/", (req, res) => {
  // Check if user is authenticated
  if (!req.session.userId) {
    // Redirect to login if not authenticated
    return res.redirect("/login");
  }

  // Fetch data from the database
  connection.query("SELECT * FROM series ORDER BY id ASC", (err, rows) => {
    if (err) {
      // Handle error and flash message
      req.flash("error", err);
      return res.render("Series", {
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
  });
});

router.post("/", (req, res) => {
  const { name, genres, imdb } = req.body;
  const query = `INSERT IGNORE INTO series (name, genre, IMDb) VALUES (?, ?, ?)`;
  connection.query(query, [name, genres, imdb], (err, results) => {
    if (err) {
      console.error(`Error adding to series: ${err.message}`);
      req.flash("error", err.message);
      return res.redirect("/series");
    }
    console.log(`Added to series: ${name} ${genres} ${imdb}`);
    res.redirect("/series");
  });
});

module.exports = router;
