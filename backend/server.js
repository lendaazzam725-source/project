// Expense Tracker - backend (Express API + PostgreSQL)
//
// PHASE 1
// Setup:
//   1. Create a database named expense_tracker and run schema.sql on it.
//   2. Copy .env.example to a new file named .env and write your PostgreSQL password.
//   3. npm install express cors pg dotenv
// Run:    node server.js   (restart it every time you change this file)
//
// Endpoints you need to build:
//   GET    /api/expenses        return all expenses
//   GET    /api/expenses/:id    return one expense (404 if not found)
//   POST   /api/expenses        add an expense (201, or 400 if the data is invalid)
//   PUT    /api/expenses/:id    update an expense (200, 400, or 404)
//   DELETE /api/expenses/:id    delete an expense (200, or 404)
//
// Tips:
//   - Create one Pool (from the "pg" library) with the values from .env,
//     and use pool.query(...) in every route.
//   - ALWAYS send the values as parameters: pool.query("... WHERE id = $1", [id]).
//     NEVER build the SQL text by joining strings with data from the user.
//   - Use RETURNING to get the new (or updated) row back from INSERT and UPDATE.
//   - The database creates the id. The client never sends one.
//   - pg returns NUMERIC as text and DATE as a JavaScript Date, so fix both in your SELECT.
//     Hint: amount::float8 and to_char(date, 'YYYY-MM-DD').
//   - Validate the data before the query, and answer 400 with a message that explains the problem.
//   - Check the id before the query. A text like "abc" makes PostgreSQL throw an error.
//   - Enable CORS so the frontend can talk to the server.
//   - Test every endpoint with Thunder Client BEFORE you connect the frontend.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];


const COLUMNS = "id, title, amount::float8 AS amount, category, to_char(date, 'DD-MM-YYYY') AS date";


function parseId(value) {
  return /^\d+$/.test(value) ? Number(value) : null;
}


function validateExpense(body) {
  const { title, amount, category, date } = body || {};

  if (typeof title !== "string" || title.trim() === "") {
    return { message: "Title is required." };
  }
  if (typeof amount !== "number" || amount <= 0) {
    return { message: "Amount must be a number greater than zero." };
  }
  if (!CATEGORIES.includes(category)) {
    return { message: "Category must be one of: " + CATEGORIES.join(", ") + "." };
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { message: "Date is required, in the format YYYY-MM-DD." };
  }
  return { data: { title: title.trim(), amount, category, date } };
}


app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM expenses ORDER BY id`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


app.get("/api/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ message: "Expense not found." });

  try {
    const result = await pool.query(`SELECT ${COLUMNS} FROM expenses WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Expense not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


app.post("/api/expenses", async (req, res) => {
  const { data, message } = validateExpense(req.body);
  if (!data) return res.status(400).json({ message });

  try {
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [data.title, data.amount, data.category, data.date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


app.put("/api/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ message: "Expense not found." });

  const { data, message } = validateExpense(req.body);
  if (!data) return res.status(400).json({ message });

  try {
    const result = await pool.query(
      `UPDATE expenses SET title = $1, amount = $2, category = $3, date = $4
       WHERE id = $5 RETURNING ${COLUMNS}`,
      [data.title, data.amount, data.category, data.date, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Expense not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


app.delete("/api/expenses/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(404).json({ message: "Expense not found." });

  try {
    const result = await pool.query(`DELETE FROM expenses WHERE id = $1 RETURNING ${COLUMNS}`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Expense not found." });
    res.json({ message: "Expense deleted.", expense: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
