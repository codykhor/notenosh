var express = require("express");
const logger = require("morgan");
const AWS = require("aws-sdk");
require("dotenv").config();
var router = express.Router();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "ap-southeast-2",
});

// Code adapted from s3-demo provided by CAB432
// Create an S3 client
const s3 = new AWS.S3();

// Specify the S3 bucket and object key
const bucketName = "cody-s3-notenosh";
const objectKey = "page-counter.json";

// JSON data to be written to S3
const jsonData = {
  pageCounter: 0,
};

async function createS3bucket() {
  try {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`Created bucket: ${bucketName}`);
  } catch (err) {
    if (err.statusCode === 409) {
      console.log(`Bucket already exists: ${bucketName}`);
    } else {
      console.log(`Error creating bucket: ${err}`);
    }
  }
}

// Upload the JSON data to S3
async function uploadJsonToS3(jsonData) {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
    Body: JSON.stringify(jsonData), // Convert JSON to string
    ContentType: "application/json", // Set content type
  };

  try {
    await s3.putObject(params).promise();
    console.log("JSON file uploaded successfully.");
  } catch (err) {
    console.error("Error uploading JSON file:", err);
  }
}

// Retrieve the object from S3
async function getObjectFromS3() {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const data = await s3.getObject(params).promise();
    // Parse JSON content
    const parsedData = JSON.parse(data.Body.toString("utf-8"));
    console.log("Parsed JSON data:", parsedData);
  } catch (err) {
    console.error("Error:", err);
  }
}

// Call the upload and get functions
(async () => {
  await createS3bucket();
  await uploadJsonToS3(jsonData);
  await getObjectFromS3();
})();

router.use(logger("tiny"));

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };
    const data = await s3.getObject(params).promise();
    const jsonData = JSON.parse(data.Body.toString("utf-8"));
    jsonData.pageCounter++;
    await uploadJsonToS3(jsonData);
    res.render("index", { pageCounter: jsonData.pageCounter });
    // res.render("index");
  } catch (err) {
    res.write(err);
    console.error("Error:", err);
  }
});

module.exports = router;
