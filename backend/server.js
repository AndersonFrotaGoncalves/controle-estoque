const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

/* CONEXÃO MYSQL */
const connection = mysql.createConnection({
  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "goJcMRFGnYcqYZltvSblgdFwVDmAaNcg",
  database: "railway",
  port: 50021
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar no MySQL:", err);
  } else {
    console.log("✅ MySQL conectado com sucesso!");
  }
});

/* SERVIR FRONTEND */
app.use(express.static(path.join(__dirname, "public")));

/* ROTA LOGIN */
app.post("/auth/login", (req, res) => {

  const { email, senha } = req.body;

  const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";

  connection.query(sql, [email, senha], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Erro no servidor" });
    }

    if (result.length > 0) {
      res.json({
        sucesso: true,
        usuario: result[0].email
      });
    } else {
      res.status(401).json({
        error: "Usuário ou senha inválidos"
      });
    }

  });

});

/* LISTAR PRODUTOS */
app.get("/produtos", (req, res) => {

  const sql = "SELECT * FROM produtos";

  connection.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Erro ao buscar produtos" });
    }

    res.json(result);

  });

});

/* CADASTRAR PRODUTO */
app.post("/produtos", (req, res) => {

  const { codigo, descricao, rack, nivel, quantidade } = req.body;

  const sql = `
    INSERT INTO produtos (codigo, descricao, rack, nivel, quantidade)
    VALUES (?, ?, ?, ?, ?)
  `;

  connection.query(
    sql,
    [codigo, descricao, rack, nivel, quantidade],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Erro ao cadastrar produto" });
      }

      res.json({ sucesso: true });

    }
  );

});

/* EXCLUIR PRODUTO */
app.delete("/produtos/:id", (req, res) => {

  const id = req.params.id;

  const sql = "DELETE FROM produtos WHERE id = ?";

  connection.query(sql, [id], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Erro ao excluir produto" });
    }

    res.json({ sucesso: true });

  });

});

/* PORTA RENDER */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});