const express = require("express");
const router = express.Router();
const con = require("../listdb.js");

router.get("/", (req, res) => {
  // Check if user is authenticated
  if (!req.session.userId) {
    // Redirect to login if not authenticated
    return res.redirect("/login");
  }

  // Fetch data from the database
  con.query("SELECT * FROM movies ORDER BY id ASC", (err, rows) => {
    if (err) {
      // Handle error and flash message
      req.flash("error", err);
      return res.render("movies", {
        page_title: "Movies",
        data: [],
        username: req.session.username,
      });
    }

    // Render the view with the fetched data
    res.render("movies", {
      page_title: "Movies",
      data: rows,
      username: req.session.username,
    });
  });
});

router.post("/", (req, res) => {
  const { name, genres, imdb } = req.body;
  const query = `INSERT IGNORE INTO movies (name, genre, IMDb) VALUES (?, ?, ?)`;
  con.query(query, [name, genres, imdb], (err, results) => {
    if (err) {
      console.error(`Error adding to movies: ${err.message}`);
      req.flash("error", err.message);
      return res.redirect("/movies");
    }
    console.log(`Added to movies: ${name} ${genres} ${imdb}`);
    res.redirect("/movies");
  });
});

module.exports = router;
