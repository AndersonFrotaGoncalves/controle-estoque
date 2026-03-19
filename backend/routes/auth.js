const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

router.post("/login", (req, res) => {

    const { email, senha } = req.body;

    console.log("LOGIN BACKEND RECEBIDO:", email);

    if (!email || !senha) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {

        if (err) {
            console.error("ERRO MYSQL:", err);
            return res.status(500).json({ error: "Erro no servidor" });
        }

        if (!result || result.length === 0) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const usuario = result[0];

        // 🔥 valida se senha existe no banco
        if (!usuario.senha) {
            console.error("Usuário sem senha no banco");
            return res.status(500).json({ error: "Erro interno (senha inválida)" });
        }

        // 🔥 comparação segura sem travar
        bcrypt.compare(senha, usuario.senha, (err, senhaValida) => {

            if (err) {
                console.error("ERRO BCRYPT:", err);
                return res.status(500).json({ error: "Erro ao validar senha" });
            }

            if (!senhaValida) {
                return res.status(401).json({ error: "Senha inválida" });
            }

            // ✅ resposta correta
            return res.json({
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    role: usuario.role
                }
            });

        });

    });

});

module.exports = router;