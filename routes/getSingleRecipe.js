const express = require("express");
const router = express.Router();
const pool = require("../database");
const { getPresignedUrl } = require("./aws.js");

router.get("/:id", async (req, res) => {
  console.log("SINGLE RECIPE");
  const { id } = req.params;
  try {
    const recipeResult = await pool.query(
      "SELECT * FROM recipes WHERE id = $1",
      [id]
    );
    const recipe = recipeResult.rows[0];
    if (recipe && recipe.s3imagekey) {
      const key = recipe.s3imagekey;
      const preSigned = await getPresignedUrl(key);
      recipe.image = preSigned;
    }
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
