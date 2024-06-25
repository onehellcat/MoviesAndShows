const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // Check if user is authenticated
  if (!req.session.userId) {
    // Redirect to login if not authenticated
    return res.redirect("/login");
  }

  // Render the landing page
  res.render("Home", { username: req.session.username });
});

module.exports = router;
