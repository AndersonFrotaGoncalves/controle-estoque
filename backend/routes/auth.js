const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "super_chave_secreta_empresa";

/* ============================
   LOGIN
============================ */

router.post("/login", (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            error: "Preencha email e senha"
        });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        if (err) {
            console.error("Erro login:", err);
            return res.status(500).json({
                error: "Erro no servidor"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                error: "Usuário não encontrado"
            });
        }

        const usuario = results[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({
                error: "Senha incorreta"
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nivel: usuario.nivel
            },
            SECRET,
            { expiresIn: "8h" }
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
   REGISTRAR USUÁRIO
============================ */

router.post("/registrar", async (req, res) => {

    const { nome, email, senha, nivel } = req.body;

    if (!nome || !email || !senha || nivel === undefined) {
        return res.status(400).json({
            error: "Preencha todos os campos"
        });
    }

    try {

        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuarios (nome, email, senha, nivel)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [nome, email, senhaHash, nivel],
            (err) => {

                if (err) {

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            error: "Email já cadastrado"
                        });
                    }

                    console.error("Erro registro:", err);

                    return res.status(500).json({
                        error: "Erro ao criar usuário"
                    });

                }

                res.json({
                    message: "Usuário criado com sucesso"
                });

            }
        );

    } catch (error) {

        res.status(500).json({
            error: "Erro ao criptografar senha"
        });

    }

});

module.exports = router;