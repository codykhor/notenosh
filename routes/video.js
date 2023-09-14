const axios = require("axios");
var express = require("express");
const logger = require("morgan");
var router = express.Router();
require("dotenv").config();

router.use(logger("tiny"));
/* GET home page. */
router.get("/", function (req, res, next) {
  // Parse URL query string
  const searchTermForVideo = req.query.name;

  // Make API calls
  const options = {
    method: "GET",
    url: "https://youtube.googleapis.com/youtube/v3/search?",
    params: {
      part: "snippet",
      maxResults: "3",
      q: `${searchTermForVideo}`,
      type: "video",
      key: process.env.YOUTUBE_API_KEY,
    },
    headers: {
      accept: "application/json",
    },
  };
  console.log(options);

  // Results found
  axios
    .request(options)
    .then(function (response) {
      const data = response.data;
      const videos = data.items;
      const formattedVideoData = [];
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const id = video.id.videoId;
        const title = video.snippet.title;
        formattedVideoData.push({
          id,
          title,
        });
      }
      res.render("video", { formattedVideoData, searchTermForVideo });
    })
    // If no results are found
    .catch(function (error) {
      res.render("no-video-results");
    });
});

module.exports = router;
