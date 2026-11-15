// Gestão de utilizadores (apenas administradores).
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();
const falha = (res, status, msg) => res.status(status).json({ error: msg });
const ROLES = ["admin", "user"];

router.get("/", async (req, res) => {
  try {
    res.json(await db.run("SELECT id, nome, email, role FROM usuarios ORDER BY nome"));
  } catch (err) {
    console.error(err);
    falha(res, 500, "Error loading users.");
  }
});

router.post("/", async (req, res) => {
  const nome = String(req.body.nome || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const senha = String(req.body.senha || "");
  const role = req.body.role;
  if (!nome || !email || !senha || !role) return falha(res, 400, "Fill in all fields.");
  if (!ROLES.includes(role)) return falha(res, 400, "Invalid role (use admin or user).");
  if (senha.length < 6) return falha(res, 400, "The password must have at least 6 characters.");
  try {
    const hash = await bcrypt.hash(senha, 10);
    const r = await db.run("INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)", [nome, email, hash, role]);
    res.status(201).json({ sucesso: true, id: r.insertId });
  } catch (err) {
    if (/UNIQUE|ER_DUP_ENTRY/i.test(String(err.code) + err.message)) return falha(res, 409, "A user with this email already exists.");
    console.error(err);
    falha(res, 500, "Error creating the user.");
  }
});

// Editar: campos vazios mantêm o valor atual; a senha só muda se for enviada.
router.put("/:id", async (req, res) => {
  try {
    const [atual] = await db.run("SELECT * FROM usuarios WHERE id = ?", [req.params.id]);
    if (!atual) return falha(res, 404, "User not found.");
    const nome = String(req.body.nome || "").trim() || atual.nome;
    const email = String(req.body.email || "").trim().toLowerCase() || atual.email;
    const role = req.body.role || atual.role;
    if (!ROLES.includes(role)) return falha(res, 400, "Invalid role (use admin or user).");
    if (atual.id === req.usuario.id && role !== "admin") return falha(res, 400, "You can't remove your own administrator role.");
    const senha = req.body.senha ? await bcrypt.hash(String(req.body.senha), 10) : atual.senha;
    await db.run("UPDATE usuarios SET nome = ?, email = ?, role = ?, senha = ? WHERE id = ?", [nome, email, role, senha, atual.id]);
    res.json({ sucesso: true });
  } catch (err) {
    if (/UNIQUE|ER_DUP_ENTRY/i.test(String(err.code) + err.message)) return falha(res, 409, "A user with this email already exists.");
    console.error(err);
    falha(res, 500, "Error updating the user.");
  }
});

router.delete("/:id", async (req, res) => {
  if (Number(req.params.id) === req.usuario.id) return falha(res, 400, "You can't delete your own user.");
  try {
    const r = await db.run("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    if (!r.affectedRows) return falha(res, 404, "User not found.");
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    falha(res, 500, "Error deleting the user.");
  }
});

module.exports = router;
