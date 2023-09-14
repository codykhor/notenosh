const axios = require("axios");
var express = require("express");
const logger = require("morgan");
var router = express.Router();
require("dotenv").config();

router.use(logger("tiny"));

/* GET home page. */
router.get("/", function (req, res, next) {
  const country = "AU ";
  // Parse URL query strings
  const postcode = req.query.postcode;
  const title = req.query.title;
  const city = req.query.city + " ";

  // Make API calls - code adapted from Yelp API documentation
  const options = {
    method: "GET",
    url: "https://api.yelp.com/v3/businesses/search",
    params: {
      location: `${country}${city}${postcode}`,
      sort_by: "best_match",
      limit: "9",
    },
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.YELP_API_KEY}`,
    },
  };
  // Results found
  axios
    .request(options)
    .then(function (response) {
      const data = response.data;
      const restaurants = data.businesses;
      const formattedFoodData = [];
      for (let i = 0; i < restaurants.length; i++) {
        const restaurant = restaurants[i];
        const name = restaurant.name;
        const image = restaurant.image_url;
        const url = restaurant.url;
        const address = restaurant.location.display_address;
        const phone = restaurant.display_phone;
        const price = restaurant.price;
        formattedFoodData.push({
          name,
          image,
          url,
          address,
          phone,
          price,
        });
      }
      res.render("food", { formattedFoodData, title });
    })
    // If no results are found
    .catch(function (error) {
      res.render("no-food-results", { title });
    });
});

module.exports = router;
