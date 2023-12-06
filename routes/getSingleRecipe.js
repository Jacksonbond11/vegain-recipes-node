const express = require("express");
const router = express.Router();
const { getPresignedUrl } = require("./aws.js");

router.get("/recipes/:id", async (req, res) => {
  console.log("SINGLE RECIPE");
  const { id } = req.params;
  try {
    const recipe = await pool.query("SELECT * FROM recipes WHERE id = $1", [
      id,
    ]);
    let res = res.json(recipe.rows[0]);
    console.log(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
