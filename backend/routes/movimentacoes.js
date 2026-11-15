const express = require("express");
const db = require("../db");

const router = express.Router();
const falha = (res, status, msg) => res.status(status).json({ error: msg, erro: msg });

router.get("/movimentacoes", async (req, res) => {
  try {
    res.json(await db.run(`
      SELECT m.*, p.descricao, p.codigo
      FROM movimentacoes m
      JOIN produtos p ON m.produto_id = p.id
      ORDER BY m.data DESC, m.id DESC`));
  } catch (err) {
    console.error(err);
    falha(res, 500, "Error loading movements.");
  }
});

router.post("/movimentacoes", async (req, res) => {
  const produtoId = Number(req.body.produto_id);
  const tipo = req.body.tipo;
  const quantidade = Number(req.body.quantidade);
  const observacao = String(req.body.observacao || "").trim() || null;

  if (!produtoId || !["entrada", "saida"].includes(tipo)) return falha(res, 400, "Invalid data.");
  if (!Number.isInteger(quantidade) || quantidade <= 0) return falha(res, 400, "Quantity must be a whole number greater than zero.");

  try {
    // A atualização só acontece se houver stock suficiente: a condição está
    // no próprio UPDATE, por isso duas saídas em simultâneo não deixam o stock negativo.
    const r = tipo === "entrada"
      ? await db.run("UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?", [quantidade, produtoId])
      : await db.run("UPDATE produtos SET quantidade = quantidade - ? WHERE id = ? AND quantidade >= ?", [quantidade, produtoId, quantidade]);

    if (!r.affectedRows) {
      const [p] = await db.run("SELECT quantidade FROM produtos WHERE id = ?", [produtoId]);
      if (!p) return falha(res, 404, "Product not found.");
      return falha(res, 400, `Not enough stock: there are ${p.quantidade} unit(s).`);
    }

    // o utilizador vem do token, não do corpo do pedido
    await db.run(
      "INSERT INTO movimentacoes (produto_id, tipo, quantidade, observacao, usuario) VALUES (?, ?, ?, ?, ?)",
      [produtoId, tipo, quantidade, observacao, req.usuario.email]);

    const [atual] = await db.run("SELECT quantidade FROM produtos WHERE id = ?", [produtoId]);
    res.status(201).json({ sucesso: true, quantidade: atual.quantidade });
  } catch (err) {
    console.error(err);
    falha(res, 500, "Error saving the movement.");
  }
});

module.exports = router;
