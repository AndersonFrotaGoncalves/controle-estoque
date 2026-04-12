const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================================
   LISTAR MOVIMENTAÇÕES
================================ */
router.get("/movimentacoes", async (req, res) => {

    try {

        const result = await db.query(`
          SELECT 
            movimentacoes.*, 
            produtos.descricao,
            produtos.codigo
          FROM movimentacoes
          JOIN produtos 
          ON movimentacoes.produto_id = produtos.id
          ORDER BY data DESC
        `);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao buscar movimentações" });
    }

});


/* ================================
   SALVAR MOVIMENTAÇÃO
================================ */
router.post("/movimentacoes", async (req, res) => {

    const { produto_id, tipo, quantidade, observacao, usuario } = req.body;

    if (!produto_id || !tipo || !quantidade) {
        return res.status(400).json({ erro: "Dados inválidos" });
    }

    if (!["entrada", "saida"].includes(tipo)) {
        return res.status(400).json({ erro: "Tipo inválido" });
    }

    try {

        const result = await db.query(
            "SELECT quantidade FROM produtos WHERE id = $1",
            [produto_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado" });
        }

        const estoqueAtual = result.rows[0].quantidade;

        if (tipo === "saida" && quantidade > estoqueAtual) {
            return res.status(400).json({ erro: "Estoque insuficiente" });
        }

        await db.query(
            "INSERT INTO movimentacoes (produto_id, tipo, quantidade, observacao, usuario) VALUES ($1, $2, $3, $4, $5)",
            [produto_id, tipo, quantidade, observacao, usuario]
        );

        const queryUpdate = tipo === "entrada"
            ? "UPDATE produtos SET quantidade = quantidade + $1 WHERE id = $2"
            : "UPDATE produtos SET quantidade = quantidade - $1 WHERE id = $2";

        await db.query(queryUpdate, [quantidade, produto_id]);

        res.json({ sucesso: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao salvar movimentação" });
    }

});


/* ================================
   LOTE
================================ */
router.post("/movimentacoes/lote", async (req, res) => {

    const { itens, usuario } = req.body;

    console.log("LOTE RECEBIDO:", itens);

    try {

        for (const item of itens) {

            const result = await db.query(
                "SELECT id, quantidade FROM produtos WHERE codigo = $1",
                [item.codigo]
            );

            if (!result.rows.length) {
                console.log("Produto não encontrado:", item.codigo);
                continue;
            }

            const produtoId = result.rows[0].id;
            let quantidadeAtual = result.rows[0].quantidade;

            if (item.tipo === "saida") {
                quantidadeAtual -= item.quantidade;
            } else {
                quantidadeAtual += item.quantidade;
            }

            await db.query(
                "UPDATE produtos SET quantidade = $1 WHERE id = $2",
                [quantidadeAtual, produtoId]
            );

            await db.query(
                `INSERT INTO movimentacoes 
                (produto_id, tipo, quantidade, observacao, usuario) 
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    produtoId,
                    item.tipo,
                    item.quantidade,
                    item.observacao || "",
                    usuario
                ]
            );

        }

        res.json({ sucesso: true });

    } catch (error) {
        console.error("ERRO BACKEND:", error);
        res.status(500).json({ error: "Erro ao salvar lote" });
    }

});

module.exports = router;