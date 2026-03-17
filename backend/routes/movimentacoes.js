const express = require("express");
const router = express.Router();
const db = require("../db");


// ================================
// LISTAR MOVIMENTAÇÕES
// ================================
router.get("/movimentacoes", async (req, res) => {

    try{

        const [dados] = await db.query(`
            SELECT 
                movimentacoes.*, 
                produtos.descricao
            FROM movimentacoes
            JOIN produtos 
            ON movimentacoes.produto_id = produtos.id
            ORDER BY data DESC
        `);

        res.json(dados);

    }catch(error){

        console.error(error);
        res.status(500).json(error);

    }

});


// ================================
// SALVAR MOVIMENTAÇÃO
// ================================
router.post("/movimentacoes", async (req, res) => {

    const { produto_id, tipo, quantidade, observacao, usuario } = req.body;

    // 🔒 VALIDAÇÃO
    if(!produto_id || !tipo || !quantidade){
        return res.status(400).json({ erro: "Dados inválidos" });
    }

    if(!["entrada", "saida"].includes(tipo)){
        return res.status(400).json({ erro: "Tipo inválido" });
    }

    try{

        // 🔍 pegar estoque atual
        const [produto] = await db.query(
            "SELECT quantidade FROM produtos WHERE id = ?",
            [produto_id]
        );

        if(produto.length === 0){
            return res.status(404).json({ erro: "Produto não encontrado" });
        }

        const estoqueAtual = produto[0].quantidade;

        // 🚫 impedir estoque negativo
        if(tipo === "saida" && quantidade > estoqueAtual){
            return res.status(400).json({ erro: "Estoque insuficiente" });
        }

        // 💾 salvar movimentação
        await db.query(
            "INSERT INTO movimentacoes (produto_id, tipo, quantidade, observacao, usuario) VALUES (?, ?, ?, ?, ?)",
            [produto_id, tipo, quantidade, observacao, usuario]
        );

        // 🔄 atualizar estoque
        if(tipo === "entrada"){
            await db.query(
                "UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?",
                [quantidade, produto_id]
            );
        }else{
            await db.query(
                "UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?",
                [quantidade, produto_id]
            );
        }

        res.json({ sucesso: true });

    }catch(error){

        console.error(error);
        res.status(500).json({ erro: "Erro ao salvar movimentação" });

    }

});

module.exports = router;