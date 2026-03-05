const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// servir arquivos do frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// rotas da API
const produtosRoutes = require("./routes/produtos");
const importarRoutes = require("./routes/importar");
const authRoutes = require("./routes/auth");

app.use("/produtos", produtosRoutes);
app.use("/importar", importarRoutes);
app.use("/auth", authRoutes);

// rota principal (abrir index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});