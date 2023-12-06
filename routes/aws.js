const AWS = require("aws-sdk");
const axios = require("axios");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function uploadFileToS3FromUrl(fileUrl, key) {
  console.log("uploadfiletos3fromurl called", fileUrl, key);
  try {
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "arraybuffer",
    });

    const fileBuffer = response.data;

    const params = {
      Bucket: "vegainrecipes",
      Key: key,
      Body: fileBuffer,
    };

    return s3.upload(params).promise();
  } catch (error) {
    console.error("Error downloading or uploading file:", error);
    throw error;
  }
}

function getPresignedUrl(imageKey) {
  const params = {
    Bucket: "vegainrecipes",
    Key: imageKey,
    Expires: 600,
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl("getObject", params, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
}

// Export the functions
module.exports = {
  uploadFileToS3FromUrl,
  getPresignedUrl,
};
