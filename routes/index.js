var express = require("express");
const logger = require("morgan");
var router = express.Router();

router.use(logger("tiny"));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

module.exports = router;
