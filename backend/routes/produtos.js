const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================================
   LISTAR PRODUTOS
================================ */
router.get("/produtos", async (req, res) => {

    try {
        const result = await db.query("SELECT * FROM produtos");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao buscar produtos" });
    }

});

/* ================================
   BUSCAR POR CÓDIGO
================================ */
router.get("/produtos/codigo/:codigo", async (req, res) => {

    const { codigo } = req.params;

    try {
        const result = await db.query(
            "SELECT * FROM produtos WHERE codigo = $1",
            [codigo]
        );

        res.json(result.rows[0] || null);

    } catch (err) {
        return res.status(500).json({ error: "Erro ao buscar produto" });
    }

});

/* ================================
   CRIAR PRODUTO
================================ */
router.post("/produtos", async (req, res) => {

    const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

    try {

        await db.query(
            `INSERT INTO produtos 
            (codigo, descricao, rack, nivel, quantidade, quantidade_minima)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [codigo, descricao, rack, nivel, quantidade, quantidade_minima || 2]
        );

        res.json({ sucesso: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao cadastrar produto" });
    }

});

/* ================================
   ATUALIZAR
================================ */
router.put("/produtos/:id", async (req, res) => {

    const { id } = req.params;
    const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

    try {

        await db.query(
            `UPDATE produtos SET 
            codigo=$1, descricao=$2, rack=$3, nivel=$4, quantidade=$5, quantidade_minima=$6
            WHERE id=$7`,
            [codigo, descricao, rack, nivel, quantidade, quantidade_minima, id]
        );

        res.json({ sucesso: true });

    } catch (err) {
        return res.status(500).json({ error: "Erro ao atualizar produto" });
    }

});

/* ================================
   EXCLUIR
================================ */
router.delete("/produtos/:id", async (req, res) => {

    const { id } = req.params;

    try {

        await db.query(
            "DELETE FROM produtos WHERE id = $1",
            [id]
        );

        res.json({ sucesso: true });

    } catch (err) {
        return res.status(500).json({ error: "Erro ao excluir produto" });
    }

});

module.exports = router;