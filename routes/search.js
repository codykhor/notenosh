const axios = require("axios");
var express = require("express");
const logger = require("morgan");
var router = express.Router();
require("dotenv").config();

router.use(logger("tiny"));

/* GET users listing. */
router.get("/", async function (req, res, next) {
  let searchTerm = null;
  // Make API call
  try {
    searchTerm = req.query.keyword;
    const options = createEventList(searchTerm);
    const url = `https://${options.hostname}${options.path}`;
    const response = await axios.get(url);
    if (response.status === 200) {
      const data = response.data;
      const totalElements = data.page.totalElements;
      const formattedEventData = [];
      // Handle no-results found
      if (totalElements === 0) {
        res.render("no-event-results", { searchTerm });

        // Results found
      } else {
        const events = data._embedded.events;
        for (let i = 0; i < events.length; i++) {
          const event = events[i];
          const title = event.name;
          const date = event.dates.start.localDate;
          const venue = event._embedded.venues[0].name;
          const venue_city = event._embedded.venues[0].city.name;
          const venue_state = event._embedded.venues[0].state.stateCode;
          const venue_postal = event._embedded.venues[0].postalCode;
          formattedEventData.push({
            title,
            date,
            venue,
            venue_city,
            venue_state,
            venue_postal,
          });
        }
        res.render("search", { formattedEventData });
      }
    }
  } catch (error) {
    res.render("no-event-results", { searchTerm });
  }
});

const ticketmaster = {
  apikey: process.env.TICKETMASTER_API_KEY,
  size: 20,
  sort: "date,asc",
  country: "AU",
  classification: "music",
};

// Pass search term to API endpoint
function createEventList(keyword) {
  const options = {
    hostname: "app.ticketmaster.com",
    path: "/discovery/v2/events?",
    method: "GET",
  };
  const str =
    "&apikey=" +
    ticketmaster.apikey +
    "&keyword=" +
    keyword +
    "&locale=*" +
    "&sort=" +
    ticketmaster.sort +
    "&countryCode=" +
    ticketmaster.country +
    "&classificationName=" +
    ticketmaster.classification;
  options.path += str;
  return options;
}

module.exports = router;
