const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const result = require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: "https://www.vegainrecipes.com",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Define and use your routes
const gptRoute = require("./routes/gptRoute");
const databaseRoute = require("./routes/databaseRoute");
const singleRecipe = require("./routes/getSingleRecipe");
const getAllRecipes = require("./routes/getAllRecipes");
const getList = require("./routes/listGPT");

app.use("/api/gpt", gptRoute);
app.use("/api/database", databaseRoute);
app.use("/api/recipe", singleRecipe);
app.use("/api/recipes", getAllRecipes);
app.use("/api/list", getList);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
