const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

/* CONEXÃO MYSQL */

const connection = mysql.createConnection({
  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "SUA_SENHA",
  database: "railway",
  port: 50021
});

connection.connect(err => {
  if (err) {
    console.error("Erro MySQL:", err);
  } else {
    console.log("MySQL conectado");
  }
});

/* LOGIN */

app.post("/auth/login", (req, res) => {

  const { email, senha } = req.body;

  const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";

  connection.query(sql, [email, senha], (err, result) => {

    if (err) return res.status(500).json({ error: "Erro no servidor" });

    if (result.length === 0) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    res.json({
      token: "login-ok",
      usuario: result[0]
    });

  });

});

/* LISTAR PRODUTOS */

app.get("/produtos", (req, res) => {

  connection.query("SELECT * FROM produtos", (err, result) => {

    if (err) return res.status(500).json({ error: "Erro ao buscar produtos" });

    res.json(result);

  });

});

/* CADASTRAR PRODUTO */

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
    (err, result) => {

      if (err) return res.status(500).json({ error: "Erro ao cadastrar produto" });

      res.json({ sucesso: true });

    }
  );

});

/* EXCLUIR PRODUTO */

app.delete("/produtos/:id", (req, res) => {

  const { id } = req.params;

  connection.query(
    "DELETE FROM produtos WHERE id = ?",
    [id],
    (err, result) => {

      if (err) return res.status(500).json({ error: "Erro ao excluir produto" });

      res.json({ sucesso: true });

    }
  );

});

/* PORTA */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});