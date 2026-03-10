const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2");
const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const importarRoutes = require("./routes/importar");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

/* ROTAS AUTH */
app.use("/auth", authRoutes);

app.use("/usuarios", usuariosRoutes);
app.use("/importar", importarRoutes);
/* SERVIR FRONTEND */
app.use(express.static(path.join(__dirname, "../frontend")));

/* PÁGINA INICIAL → LOGIN */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

/* CONEXÃO MYSQL */

const connection = mysql.createPool({
  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "goJcMRFGnYcqYZltvSblgdFwVDmAaNcg",
  database: "railway",
  port: 50021,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* ===============================
   LISTAR PRODUTOS
================================ */

app.get("/produtos", (req, res) => {

  connection.query("SELECT * FROM produtos", (err, result) => {

    if (err) {
      console.log("ERRO MYSQL:", err);
      return res.status(500).json(err);
    }

    res.json(result);

  });

});

/* ===============================
   CADASTRAR PRODUTO
================================ */

app.post("/produtos", (req, res) => {

  const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

  const sql = `
    INSERT INTO produtos
    (codigo, descricao, rack, nivel, quantidade, quantidade_minima)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [codigo, descricao, rack, nivel, quantidade, quantidade_minima || 2],
    (err) => {

      if (err) {
        return res.status(500).json({ error: "Erro ao cadastrar produto" });
      }

      res.json({ sucesso: true });

    }
  );

});

/* ===============================
   EDITAR PRODUTO
================================ */

app.put("/produtos/:id", (req, res) => {

  const { id } = req.params;

  const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

  const sql = `
    UPDATE produtos
    SET codigo=?, descricao=?, rack=?, nivel=?, quantidade=?, quantidade_minima=?
    WHERE id=?
  `;

  connection.query(
    sql,
    [codigo, descricao, rack, nivel, quantidade, quantidade_minima, id],
    (err) => {

      if (err) {
        return res.status(500).json({ error: "Erro ao atualizar produto" });
      }

      res.json({ sucesso: true });

    }
  );

});

/* ===============================
   EXCLUIR PRODUTO
================================ */

app.delete("/produtos/:id", (req, res) => {

  const { id } = req.params;

  connection.query(
    "DELETE FROM produtos WHERE id = ?",
    [id],
    (err) => {

      if (err) {
        return res.status(500).json({ error: "Erro ao excluir produto" });
      }

      res.json({ sucesso: true });

    }
  );

});

/* ===============================
   PORTA
================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});