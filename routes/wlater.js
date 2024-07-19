const express = require("express");
const router = express.Router();
const con = require("../listdb.js"); // Assuming this is your database connection module

// Utility function to handle retries
const executeQueryWithRetry = (query, params, retries = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      con.query(query, params, (err, results) => {
        if (err) {
          if (err.code === "ER_LOCK_WAIT_TIMEOUT" && n > 0) {
            console.log(`Retrying query: ${query}. Attempts left: ${n}`);
            return setTimeout(() => attempt(n - 1), delay);
          }
          return reject(err);
        }
        resolve(results);
      });
    };
    attempt(retries);
  });
};

// GET request handler for /watchlater route
router.get("/", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const userUUID = req.session.userId;
  const watchlaterQuery =
    "SELECT * FROM watchlater WHERE userUUID = ? ORDER BY id ASC";

  con.query(watchlaterQuery, [userUUID], (err, rows) => {
    if (err) {
      req.flash("error", err.message);
      return res.render("watchlater", {
        page_title: "Watchlater",
        data: [],
        username: req.session.username,
      });
    }

    res.render("watchlater", {
      page_title: "Watchlater",
      data: rows,
      username: req.session.username,
    });
  });
});

// POST request handler for /watchlater route (adding new item to watchlater list)
router.post("/", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const { name, type, genre, IMDb } = req.body;
  const userUUID = req.session.userId;
  const query =
    "INSERT IGNORE INTO watchlater (name, type, userUUID, genre, IMDb) VALUES (?, ?, ?, ?, ?)";

  con.query(query, [name, type, userUUID, genre, IMDb], (err, results) => {
    if (err) {
      console.error(`Error adding to watchlater: ${err.message}`);
      req.flash("error", err.message);
      return res.redirect("/watchlater");
    }

    console.log(`Added to watchlater: ${name} ${type} ${userUUID}`);
    res.redirect("/watchlater");
  });
});

// Add (Seen)
router.get("/seen/:id", (req, res) => {
  const id = req.params.id;
  const fetchQuery =
    "SELECT name, type, userUUID, genre, IMDb FROM watchlater WHERE id = ?";

  con.query(fetchQuery, [id], (err, results) => {
    if (err) {
      console.error(`Error fetching from watchlater: ${err.message}`);
      req.flash("error", "Error fetching item from watchlater");
      return res.redirect("/watchlater");
    }

    if (results.length === 0) {
      req.flash("error", "Item not found in watchlater");
      return res.redirect("/watchlater");
    }

    const item = results[0];
    const { name, genre, IMDb, userUUID, type } = item;
    let targetTable =
      type === "movies" ? "movies" : type === "series" ? "series" : null;

    if (!targetTable) {
      req.flash("error", `Invalid type: ${type}`);
      return res.redirect("/watchlater");
    }

    const insertQuery = `INSERT INTO ${targetTable} (name, genre, IMDb, userUUID) VALUES (?, ?, ?, ?)`;
    con.query(
      insertQuery,
      [name, genre, IMDb, userUUID],
      (err, insertResult) => {
        if (err) {
          console.error(`Error inserting into ${targetTable}: ${err.message}`);
          req.flash("error", `Error inserting into ${targetTable}`);
          return res.redirect("/watchlater");
        }

        const deleteQuery = "DELETE FROM watchlater WHERE id = ?";
        executeQueryWithRetry(deleteQuery, [id])
          .then((deleteResult) => {
            req.flash("success", "Item moved successfully");
            res.redirect("/watchlater");
          })
          .catch((err) => {
            console.error(`Error deleting from watchlater: ${err.message}`);
            req.flash("error", "Error deleting item from watchlater");
            res.redirect("/watchlater");
          });
      }
    );
  });
});

// Edit
router.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM watchlater WHERE id = ?";

  con.query(query, [id], (err, data) => {
    if (err) {
      req.flash("error", "Error fetching item to edit");
      return res.redirect("/watchlater");
    }

    res.render("watchlater", {
      action: "edit",
      sampleData: data[0],
    });
  });
});

// Delete
router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM watchlater WHERE id = ?";

  executeQueryWithRetry(query, [id])
    .then((data) => {
      res.redirect("/watchlater");
    })
    .catch((err) => {
      console.error(`Error deleting from watchlater: ${err.message}`);
      req.flash("error", "Error deleting item from watchlater");
      res.redirect("/watchlater");
    });
});

module.exports = router;
