const express = require("express");
const router = express.Router();
const pool = require("../database");
const { getPresignedUrl } = require("./aws.js");

router.get("/recipes", async (req, res) => {
  console.log("recipes endpoint hit");
  try {
    let recipes = await pool.query("SELECT * FROM recipes");
    recipes = recipes.rows;

    for (let i = 0; i < recipes.length; i++) {
      if (recipes[i].s3imagekey) {
        key = recipes[i].s3imagekey;
        const preSigned = await getPresignedUrl(key);
        recipes[i].image = preSigned;
      }
    }

    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
