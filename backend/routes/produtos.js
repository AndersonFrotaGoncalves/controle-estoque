const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================================
   LISTAR PRODUTOS
================================ */
router.get("/produtos", (req, res) => {

    db.query("SELECT * FROM produtos", (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao buscar produtos" });
        }

        res.json(result);

    });

});

/* ================================
   BUSCAR POR CÓDIGO
================================ */
router.get("/produtos/codigo/:codigo", (req, res) => {

    const { codigo } = req.params;

    db.query(
        "SELECT * FROM produtos WHERE codigo = ?",
        [codigo],
        (err, result) => {

            if (err) {
                return res.status(500).json({ error: "Erro ao buscar produto" });
            }

            res.json(result[0] || null);

        }
    );

});

/* ================================
   CRIAR PRODUTO
================================ */
router.post("/produtos", (req, res) => {

    const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

    db.query(
        `INSERT INTO produtos 
        (codigo, descricao, rack, nivel, quantidade, quantidade_minima)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [codigo, descricao, rack, nivel, quantidade, quantidade_minima || 2],
        (err) => {

            if (err) {
                return res.status(500).json({ error: "Erro ao cadastrar produto" });
            }

            res.json({ sucesso: true });

        }
    );

});

/* ================================
   ATUALIZAR
================================ */
router.put("/produtos/:id", (req, res) => {

    const { id } = req.params;
    const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

    db.query(
        `UPDATE produtos SET 
        codigo=?, descricao=?, rack=?, nivel=?, quantidade=?, quantidade_minima=?
        WHERE id=?`,
        [codigo, descricao, rack, nivel, quantidade, quantidade_minima, id],
        (err) => {

            if (err) {
                return res.status(500).json({ error: "Erro ao atualizar produto" });
            }

            res.json({ sucesso: true });

        }
    );

});

/* ================================
   EXCLUIR
================================ */
router.delete("/produtos/:id", (req, res) => {

    const { id } = req.params;

    db.query(
        "DELETE FROM produtos WHERE id = ?",
        [id],
        (err) => {

            if (err) {
                return res.status(500).json({ error: "Erro ao excluir produto" });
            }

            res.json({ sucesso: true });

        }
    );

});

module.exports = router;