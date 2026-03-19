const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

/* ===============================
   LISTAR USUÁRIOS
================================ */

router.get("/usuarios", (req, res) => {

    db.query("SELECT id, nome, email, role FROM usuarios", (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao buscar usuários" });
        }

        res.json(result);

    });

});

/* ===============================
   CRIAR USUÁRIO
================================ */

router.post("/usuarios", (req, res) => {

    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha || !role) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    // 🔥 criptografar senha
    bcrypt.hash(senha, 10, (err, hash) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao criptografar senha" });
        }

        db.query(
            "INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
            [nome, email, hash, role],
            (err) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Erro ao criar usuário" });
                }

                res.json({ sucesso: true });

            }
        );

    });

});

module.exports = router;