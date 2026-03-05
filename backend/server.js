const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));

// ROTAS API
const produtosRoutes = require("./routes/produtos");
const importarRoutes = require("./routes/importar");
const authRoutes = require("./routes/auth");

app.use("/produtos", produtosRoutes);
app.use("/importar", importarRoutes);
app.use("/auth", authRoutes);

// ABRIR INDEX
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});