const axios = require("axios");
var express = require("express");
const logger = require("morgan");
var router = express.Router();
require("dotenv").config();

router.use(logger("tiny"));

/* GET home page. */
router.get("/", async function (req, res, next) {
  // Get today's date
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const startTime = "T00:00:00Z";
  const endTime = "T23:59:59Z";
  // Check if day and month are between 1 - 9
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  startDate = `${year}-${formattedMonth}-${formattedDay}${startTime}`;
  endDate = `${year}-${formattedMonth}-${formattedDay}${endTime}`;

  // Make API call
  try {
    const options = createTodayList(startDate, endDate);
    const url = `https://${options.hostname}${options.path}`;
    console.log(url);
    const response = await axios.get(url);
    if (response.status === 200) {
      const data = response.data;
      const totalElements = data.page.totalElements;
      const formattedTodayData = [];
      // Handle no-results found
      if (totalElements === 0) {
        res.render("no-today-results");

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
          formattedTodayData.push({
            title,
            date,
            venue,
            venue_city,
            venue_state,
            venue_postal,
          });
        }
        res.render("today", { formattedTodayData });
      }
    }
  } catch (error) {
    res.render("no-today-results");
  }
});

const ticketmaster = {
  apikey: process.env.TICKETMASTER_API_KEY,
  size: 20,
  country: "AU",
  classification: "music",
};

// Pass date to API endpoint
function createTodayList(start, end) {
  const options = {
    hostname: "app.ticketmaster.com",
    path: "/discovery/v2/events?",
    method: "GET",
  };

  const str =
    "&apikey=" +
    ticketmaster.apikey +
    "&locale=*" +
    "&startDateTime=" +
    start +
    "&endDateTime=" +
    end +
    "&countryCode=" +
    ticketmaster.country +
    "&classificationName=" +
    ticketmaster.classification;
  options.path += str;
  return options;
}

module.exports = router;
