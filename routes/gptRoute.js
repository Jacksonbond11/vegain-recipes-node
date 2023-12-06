const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const axios = require("axios");
const OpenAIApi = require("openai");
require("dotenv").config();
const pool = require("../database");
const { v4: uuidv4 } = require("uuid");
const { uploadFileToS3FromUrl, getPresignedUrl } = require("./aws.js");

function generateKey(fileName) {
  const uniqueKey = uuidv4();
  console.log("generatekey called: ", uniqueKey);
  return `uploads/${uniqueKey}-${fileName}`;
}

module.exports = router;

const API_KEY = process.env.OPENAITOKEN;

async function searchOpenAI(query) {
  console.log("gpt API called");
  console.log("query is", query);
  if (!query) {
    return { message: "query is empty" };
  }
  console.log("API called");
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
            "You are a helpful tool for finding vegan recipes on the internet. You only look for vegan recipes. You respond in JSON format.",
        },
        {
          role: "user",
          content: `Find a vegan recipe for ${query} and return it as a JSON object without any additional words or information. Do not say "Here's a vegan recipe". Format the response like this JSON example:
{
  "name": "Recipe name",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "instructions": ["Step 1", "Step 2"],
  "description": "Short description"
}`,
        },
      ],
    }),
  });

  const data = await response.json();
  const message = data.choices[0].message.content;
  const parsedContent = JSON.parse(message);
  const dalleImage = await getDalleImage(parsedContent.name);
  if (dalleImage) {
    parsedContent.image = dalleImage;
    console.log(parsedContent.image);
  }

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

async function getDalleImage(title) {
  console.log("dalle api called");
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        prompt:
          "make an image of the following food and make it delicious:" + title,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data.data[0];

    const image = data["url"];
    return image;
  } catch (error) {
    console.error("Error calling deepai API:", error);
    return null;
  }
}

async function saveRecipeToDatabase(recipe) {
  const client = await pool.connect(); // Get a new client connection from the pool
  try {
    const { name, ingredients, instructions, description, image } = recipe;
    const s3ImageKey = generateKey(recipe.name);
    uploadFileToS3FromUrl(image, s3ImageKey);
    await client.query(
      "INSERT INTO recipes (name, ingredients, instructions, description, s3ImageKey) VALUES ($1, CAST($2 AS text), CAST($3 AS text), $4, $5)",
      [
        name,
        ingredients.join("\n"),
        instructions.join("\n"),
        description,
        s3ImageKey,
      ]
    );
    console.log("Recipe inserted successfully");
  } catch (error) {
    console.error("Error inserting recipe into the database:", error);
  } finally {
    client.release();
  }
}

router.post("/call-gpt", async (req, res) => {
  console.log("gpt api called!!");
  const query = req.body.query;

  if (query) {
    const recipe = await searchOpenAI(query);
    if (recipe.image_url) {
    }

    res.status(200).json(recipe);
  } else {
    res.status(400).json({ error: "No query provided" });
  }
});

module.exports = router;
