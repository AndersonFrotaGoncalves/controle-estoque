const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

/* ===============================
   LISTAR USUÁRIOS
================================ */
router.get("/", async (req, res) => {

    try {

        const result = await db.query("SELECT id, nome, email, role FROM usuarios");

        res.json(result.rows); // 🔥 CORRETO

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }

});

/* ===============================
   CRIAR USUÁRIO
================================ */
router.post("/", async (req, res) => {

    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha || !role) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    try {

        const hash = await bcrypt.hash(senha, 10);

        await db.query(
            "INSERT INTO usuarios (nome, email, senha, role) VALUES ($1, $2, $3, $4)",
            [nome, email, hash, role]
        );

        res.json({ sucesso: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar usuário" });
    }

});

/* ===============================
   EXCLUIR USUÁRIO
================================ */
router.delete("/:id", async (req, res) => {

    const { id } = req.params;

    try {

        await db.query("DELETE FROM usuarios WHERE id = $1", [id]);

        res.json({ sucesso: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao excluir usuário" });
    }

});

module.exports = router;