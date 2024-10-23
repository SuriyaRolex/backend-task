const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

// Middleware to parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error in client", err.stack);
  }
  console.log("Connected to pg database");
  release();
});

app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description FROM master_genders where deleted_by is null"
    );
    console.log(result, "result");

    res.json({ masterData: result?.rows ?? [] });
  } catch (error) {
    console.error("database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/", async (req, res) => {
  try {
    const { id, name, mobile_number, gender } = req.body;
    const query = `INSERT INTO users (id, username, mobile_number, gender) VALUES ($1, $2, $3, $4) RETURNING *`;

    const values = [id, name, mobile_number, gender];

    const result = await pool.query(query, values);
    console.log(result, "result");

    res.status(201).json({ message: "user added", user: result.rows[0] ?? [] });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
