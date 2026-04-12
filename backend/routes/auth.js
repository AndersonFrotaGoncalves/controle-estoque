const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res) => {

    const { email, senha } = req.body;

    console.log("LOGIN BACKEND RECEBIDO:", email);

    if (!email || !senha) {
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    try {

        const result = await db.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const usuario = result.rows[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: "Senha inválida" });
        }

       return res.json({
    usuario: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role // 🔥 ESSENCIAL
    }
});

    } catch (err) {
        console.error("ERRO LOGIN:", err);
        return res.status(500).json({ error: "Erro no servidor" });
    }

});

module.exports = router;