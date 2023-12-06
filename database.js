const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: "jb",
  host: process.env.DATABASE_HOST,
  database: "defaultdb",
  password: process.env.DATABASE_PASSWORD,
  port: 26257,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
