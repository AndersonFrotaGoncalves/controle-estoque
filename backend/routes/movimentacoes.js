const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================================
   LISTAR MOVIMENTAÇÕES
================================ */
router.get("/movimentacoes", (req, res) => {

    db.query(`
      SELECT 
        movimentacoes.*, 
        produtos.descricao,
        produtos.codigo
    FROM movimentacoes
    JOIN produtos 
    ON movimentacoes.produto_id = produtos.id
    ORDER BY data DESC
`, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ erro: "Erro ao buscar movimentações" });
        }

        res.json(result);

    });

});



/* ================================
   SALVAR MOVIMENTAÇÃO
================================ */
router.post("/movimentacoes", (req, res) => {

    const { produto_id, tipo, quantidade, observacao, usuario } = req.body;

    // 🔒 VALIDAÇÃO
    if (!produto_id || !tipo || !quantidade) {
        return res.status(400).json({ erro: "Dados inválidos" });
    }

    if (!["entrada", "saida"].includes(tipo)) {
        return res.status(400).json({ erro: "Tipo inválido" });
    }

    // 🔍 pegar estoque atual
    db.query(
        "SELECT quantidade FROM produtos WHERE id = ?",
        [produto_id],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ erro: "Erro ao buscar produto" });
            }

            if (!result || result.length === 0) {
                return res.status(404).json({ erro: "Produto não encontrado" });
            }

            const estoqueAtual = result[0].quantidade;

            // 🚫 impedir estoque negativo
            if (tipo === "saida" && quantidade > estoqueAtual) {
                return res.status(400).json({ erro: "Estoque insuficiente" });
            }

            // 💾 salvar movimentação
            db.query(
                "INSERT INTO movimentacoes (produto_id, tipo, quantidade, observacao, usuario) VALUES (?, ?, ?, ?, ?)",
                [produto_id, tipo, quantidade, observacao, usuario],
                (err) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({ erro: "Erro ao salvar movimentação" });
                    }

                    // 🔄 atualizar estoque
                    const queryUpdate = tipo === "entrada"
                        ? "UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?"
                        : "UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?";

                    db.query(
                        queryUpdate,
                        [quantidade, produto_id],
                        (err) => {

                            if (err) {
                                console.error(err);
                                return res.status(500).json({ erro: "Erro ao atualizar estoque" });
                            }

                            res.json({ sucesso: true });

                        }
                    );

                }
            );

        }
    );

});

module.exports = router;



router.post("/movimentacoes/lote", async (req, res) => {

    const { itens, usuario } = req.body;

    console.log("LOTE RECEBIDO:", itens);

    try {

        for (const item of itens) {

            const [produto] = await db.promise().query(
                "SELECT id, quantidade FROM produtos WHERE codigo = ?",
                [item.codigo]
            );

            if (!produto.length) {
                console.log("Produto não encontrado:", item.codigo);
                continue;
            }

            const produtoId = produto[0].id;
            let quantidadeAtual = produto[0].quantidade;

            // 🔥 REGRA DE NEGÓCIO
            if (item.tipo === "saida") {
                quantidadeAtual -= item.quantidade;
            } else {
                quantidadeAtual += item.quantidade;
            }

            // 🔥 ATUALIZA ESTOQUE
            await db.promise().query(
                "UPDATE produtos SET quantidade = ? WHERE id = ?",
                [quantidadeAtual, produtoId]
            );

            // 🔥 REGISTRA MOVIMENTAÇÃO
            await db.promise().query(
                `INSERT INTO movimentacoes 
                (produto_id, tipo, quantidade, observacao, usuario) 
                VALUES (?, ?, ?, ?, ?)`,
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