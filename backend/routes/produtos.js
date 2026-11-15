const express = require("express");
const db = require("../db");
const { apenasAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

const falha = (res, status, msg) => res.status(status).json({ error: msg, erro: msg });
const duplicado = (err) => /UNIQUE|ER_DUP_ENTRY/i.test(String(err?.code) + String(err?.message));

// Valida e normaliza os campos enviados pelo formulário.
function lerProduto(body) {
  const p = {
    codigo: String(body.codigo || "").trim().toUpperCase(),
    descricao: String(body.descricao || "").trim(),
    rack: String(body.rack || "").trim().toUpperCase() || null,
    nivel: String(body.nivel ?? "").trim() || null,
    quantidade: Number(body.quantidade ?? 0),
    quantidade_minima: body.quantidade_minima === "" || body.quantidade_minima == null ? 2 : Number(body.quantidade_minima),
  };
  if (!p.codigo) return { erro: "Indique o código do produto." };
  if (!p.descricao) return { erro: "Indique a descrição do produto." };
  if (!Number.isInteger(p.quantidade) || p.quantidade < 0) return { erro: "A quantidade tem de ser um número inteiro, 0 ou mais." };
  if (!Number.isInteger(p.quantidade_minima) || p.quantidade_minima < 0) return { erro: "A quantidade mínima tem de ser um número inteiro, 0 ou mais." };
  return { p };
}

router.get("/produtos", async (req, res) => {
  try {
    res.json(await db.run("SELECT * FROM produtos ORDER BY codigo"));
  } catch (err) {
    console.error(err);
    falha(res, 500, "Erro ao buscar produtos.");
  }
});

router.get("/produtos/codigo/:codigo", async (req, res) => {
  try {
    const [p] = await db.run("SELECT * FROM produtos WHERE codigo = ?", [req.params.codigo.trim().toUpperCase()]);
    res.json(p || null);
  } catch (err) {
    falha(res, 500, "Erro ao buscar produto.");
  }
});

router.get("/produtos/:id", async (req, res) => {
  const [p] = await db.run("SELECT * FROM produtos WHERE id = ?", [req.params.id]);
  if (!p) return falha(res, 404, "Produto não encontrado.");
  res.json(p);
});

router.post("/produtos", apenasAdmin, async (req, res) => {
  const { p, erro } = lerProduto(req.body);
  if (erro) return falha(res, 400, erro);
  try {
    const r = await db.run(
      "INSERT INTO produtos (codigo, descricao, rack, nivel, quantidade, quantidade_minima) VALUES (?, ?, ?, ?, ?, ?)",
      [p.codigo, p.descricao, p.rack, p.nivel, p.quantidade, p.quantidade_minima]);
    res.status(201).json({ sucesso: true, id: r.insertId });
  } catch (err) {
    if (duplicado(err)) return falha(res, 409, `Já existe um produto com o código ${p.codigo}.`);
    console.error(err);
    falha(res, 500, "Erro ao cadastrar produto.");
  }
});

router.put("/produtos/:id", apenasAdmin, async (req, res) => {
  const { p, erro } = lerProduto(req.body);
  if (erro) return falha(res, 400, erro);
  try {
    const r = await db.run(
      "UPDATE produtos SET codigo = ?, descricao = ?, rack = ?, nivel = ?, quantidade = ?, quantidade_minima = ? WHERE id = ?",
      [p.codigo, p.descricao, p.rack, p.nivel, p.quantidade, p.quantidade_minima, req.params.id]);
    if (!r.affectedRows) return falha(res, 404, "Produto não encontrado.");
    res.json({ sucesso: true });
  } catch (err) {
    if (duplicado(err)) return falha(res, 409, `Já existe outro produto com o código ${p.codigo}.`);
    console.error(err);
    falha(res, 500, "Erro ao atualizar produto.");
  }
});

router.delete("/produtos/:id", apenasAdmin, async (req, res) => {
  try {
    const r = await db.run("DELETE FROM produtos WHERE id = ?", [req.params.id]);
    if (!r.affectedRows) return falha(res, 404, "Produto não encontrado.");
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    falha(res, 500, "Erro ao excluir produto.");
  }
});

module.exports = router;
