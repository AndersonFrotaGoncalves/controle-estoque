const express = require("express");
const cors = require("cors");
const path = require("path");

console.log("🚀 Iniciando servidor...");

const db = require("./database");

const app = express();

/* ===============================
   ROTAS
================================ */

const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const importarRoutes = require("./routes/importar");

// 👉 se quiser ativar depois:
// const movimentacoes = require("./routes/movimentacoes");
// const produtosRoutes = require("./routes/produtos");
// const sapRoutes = require("./routes/sap");

/* ===============================
   MIDDLEWARE
================================ */

app.use(cors());
app.use(express.json());

/* ===============================
   ROTAS API
================================ */

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/importar", importarRoutes);

/* ===============================
   TESTE RÁPIDO
================================ */

app.get("/teste", (req, res) => {
  res.json({ status: "ok" });
});

/* ===============================
   PRODUTOS (direto no server)
================================ */

app.get("/produtos", (req, res) => {
  db.query("SELECT * FROM produtos", (err, result) => {
    if (err) {
      console.log("ERRO MYSQL:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

app.post("/produtos", (req, res) => {
  const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

  const sql = `
    INSERT INTO produtos
    (codigo, descricao, rack, nivel, quantidade, quantidade_minima)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [codigo, descricao, rack, nivel, quantidade, quantidade_minima || 2],
    (err) => {
      if (err) {
        console.log("ERRO MYSQL:", err);
        return res.status(500).json({ error: "Erro ao cadastrar produto" });
      }
      res.json({ sucesso: true });
    }
  );
});

app.put("/produtos/:id", (req, res) => {
  const { id } = req.params;
  const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

  const sql = `
    UPDATE produtos
    SET codigo=?, descricao=?, rack=?, nivel=?, quantidade=?, quantidade_minima=?
    WHERE id=?
  `;

  db.query(
    sql,
    [codigo, descricao, rack, nivel, quantidade, quantidade_minima, id],
    (err) => {
      if (err) {
        console.log("ERRO MYSQL:", err);
        return res.status(500).json({ error: "Erro ao atualizar produto" });
      }
      res.json({ sucesso: true });
    }
  );
});

app.delete("/produtos/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM produtos WHERE id = ?", [id], (err) => {
    if (err) {
      console.log("ERRO MYSQL:", err);
      return res.status(500).json({ error: "Erro ao excluir produto" });
    }
    res.json({ sucesso: true });
  });
});

/* ===============================
   FRONTEND
================================ */

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

/* ===============================
   PORTA
================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Servidor rodando na porta", PORT);
});