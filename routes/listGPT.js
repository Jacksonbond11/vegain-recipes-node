const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const axios = require("axios");
require("dotenv").config();

module.exports = router;

const API_KEY = process.env.OPENAITOKEN;

async function getShoppingList(query) {
  console.log("Shopping List API called");
  console.log("query is", query);
  if (!query) {
    return { message: "query is empty" };
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      // usage: { prompt_tokens: 56, completion_tokens: 31, total_tokens: 87 },
      messages: [
        {
          role: "system",
          content:
            "You are a helpful tool for creating shopping lists. You receive a recipe and determine what ingredients are needed. You create a shopping list. You respond in JSON format.",
        },
        {
          role: "user",
          content: `Create a shopping list for ${query} and return it as a JSON object without any additional words or information.`,
        },
      ],
    }),
  });

  const data = await response.json();
  const message = data.choices[0].message.content;
  const parsedContent = JSON.parse(message);

  try {
    const recipe = JSON.parse(message);
    recipe.image = parsedContent.image;
    saveRecipeToDatabase(recipe);
    return recipe;
  } catch (e) {
    console.log(e);
    return { error: e, response: message };
  }
}

router.post("/list", async (req, res) => {
  console.log("shopping list api called!!");
  let query =
    "1 tablespoon olive oil 1 onion, chopped2 cloves garlic, minced  1 can(28 ounces) crushed tomatoes 1 can (13.5 ounces) coconut milk 1 cup vegetable broth 1 teaspoon dried basil 1 teaspoon dried oregano Salt and pepper to taste";

  if (query) {
    const list = await getShoppingList(query);
    console.log(list);
    res.status(200).json(list);
  } else {
    res.status(400).json({ error: "No query provided" });
  }
});

module.exports = router;
