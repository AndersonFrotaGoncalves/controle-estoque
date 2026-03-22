const express = require("express");

console.log("🚀 SERVER STARTANDO...");

const app = express();

app.get("/", (req, res) => {
  res.send("OK RENDER 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Rodando na porta", PORT);
});