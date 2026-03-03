const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "super_chave_secreta_empresa"; // depois vamos mover para .env process.env.JWT_SECRET

/* ============================
   LOGIN
============================ */

router.post("/login", (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "Preencha email e senha" });
    }

    db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {

        if (err) return res.status(500).json({ error: "Erro no servidor" });

        if (results.length === 0) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const usuario = results[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: "Senha incorreta" });
        }

        const token = jwt.sign(
            { id: usuario.id, nivel: usuario.nivel },
            SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login realizado com sucesso",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                nivel: usuario.nivel
            }
        });

    });

});

/* ============================
   CRIAR USUÁRIO (apenas admin depois)
============================ */

router.post("/registrar", async (req, res) => {

    const { nome, email, senha, nivel } = req.body;

    if (!nome || !email || !senha || nivel === undefined){
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    db.query(
        "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)",
        [nome, email, senhaHash, nivel],
        (err) => {

            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "Email já cadastrado" });
                }
                return res.status(500).json({ error: "Erro ao criar usuário" });
            }

            res.json({ message: "Usuário criado com sucesso" });
        }
    );

});

module.exports = router;