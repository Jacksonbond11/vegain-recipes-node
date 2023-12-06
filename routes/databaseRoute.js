const express = require("express");
const router = express.Router();

async function saveRecipeToDatabase(recipe) {
  const client = await pool.connect();
  try {
    const { name, ingredients, instructions, description, image_url } = recipe;
    await client.query(
      "INSERT INTO recipes (name, ingredients, instructions, description, image_url) VALUES ($1, CAST($2 AS text), CAST($3 AS text), $4, $5)",
      [name, ingredients, instructions, description, image_url]
    );
    console.log("Recipe inserted successfully");
  } catch (error) {
    console.error("Error inserting recipe into the database:", error);
  } finally {
    client.release();
  }
}

router.post("/call-db", async (req, res) => {
  saveRecipeToDatabase();
});

module.exports = router;
