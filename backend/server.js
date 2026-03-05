const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));

// IMPORTAR ROTAS
const produtosRoutes = require("./routes/produtos");
const importarRoutes = require("./routes/importar");
const authRoutes = require("./routes/auth");

// ROTAS API
app.use("/produtos", produtosRoutes);
app.use("/importar", importarRoutes);
app.use("/auth", authRoutes);

// ABRIR FRONTEND
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// PORTA
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});