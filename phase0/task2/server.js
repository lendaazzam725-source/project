const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

app.get("/api/expenses", (req, res) => {
  res.json([
    { id: 1, title: "Lunch", amount: 4.5, category: "Food", date: "2026-01-15" },
    { id: 2, title: "Bus ticket", amount: 1.2, category: "Transport", date: "2026-01-15" },
  ]);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});