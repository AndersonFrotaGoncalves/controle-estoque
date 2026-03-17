const express = require("express");
const router = express.Router();
const db = require("../db");

// ================================
// LISTAR PRODUTOS
// ================================
router.get("/produtos", async (req, res) => {
    try {
        const [produtos] = await db.query("SELECT * FROM produtos");
        res.json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
});

// ================================
// BUSCAR POR CÓDIGO
// ================================
router.get("/produtos/codigo/:codigo", async (req, res) => {
    const { codigo } = req.params;

    try {
        const [produto] = await db.query(
            "SELECT * FROM produtos WHERE codigo = ?",
            [codigo]
        );

        res.json(produto[0] || null);
    } catch (error) {
        res.status(500).json(error);
    }
});

// ================================
// CRIAR PRODUTO
// ================================
router.post("/produtos", async (req, res) => {
    const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

    try {
        await db.query(
            `INSERT INTO produtos 
            (codigo, descricao, rack, nivel, quantidade, quantidade_minima)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [codigo, descricao, rack, nivel, quantidade, quantidade_minima || 2]
        );

        res.json({ sucesso: true });

    } catch (error) {
        res.status(500).json(error);
    }
});

// ================================
// ATUALIZAR
// ================================
router.put("/produtos/:id", async (req, res) => {
    const { id } = req.params;
    const { codigo, descricao, rack, nivel, quantidade, quantidade_minima } = req.body;

    try {
        await db.query(
            `UPDATE produtos SET 
            codigo=?, descricao=?, rack=?, nivel=?, quantidade=?, quantidade_minima=?
            WHERE id=?`,
            [codigo, descricao, rack, nivel, quantidade, quantidade_minima, id]
        );

        res.json({ sucesso: true });

    } catch (error) {
        res.status(500).json(error);
    }
});

// ================================
// EXCLUIR
// ================================
router.delete("/produtos/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM produtos WHERE id = ?", [id]);
        res.json({ sucesso: true });

    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;