const express = require("express");
const router = express.Router();
const db = require("../db");
const verificarToken = require("../middleware/authMiddleware");

// LISTAR PRODUTOS
router.get("/", (req, res) => {
    db.query("SELECT * FROM produtos", (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});


// CADASTRAR PRODUTO
router.post("/", verificarToken, (req, res) => {

    const { 
        codigo, 
        descricao, 
        rack, 
        nivel, 
        quantidade, 
        quantidade_minima 
    } = req.body;

    const sql = `
        INSERT INTO produtos
        (codigo, descricao, rack, nivel, quantidade, quantidade_minima)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            codigo, 
            descricao, 
            rack, 
            nivel, 
            quantidade, 
            quantidade_minima || 2
        ],
        (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ message: "Produto criado com sucesso" });
            }
        }
    );
});

// ATUALIZAR PRODUTO
router.put("/:id", verificarToken, (req, res) => {

    const { id } = req.params;

    const {
        codigo,
        descricao,
        rack,
        nivel,
        quantidade,
        quantidade_minima
    } = req.body;

    const sql = `
        UPDATE produtos SET
        codigo = ?,
        descricao = ?,
        rack = ?,
        nivel = ?,
        quantidade = ?,
        quantidade_minima = ?
        WHERE id = ?
    `;

    db.query(sql,
        [
            codigo,
            descricao,
            rack,
            nivel,
            quantidade,
            quantidade_minima,
            id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            res.json({ message: "Produto atualizado com sucesso" });
        }
    );
});

// EXCLUIR PRODUTO
router.delete("/:id",(req,res)=>{

const {id} = req.params;

db.query("DELETE FROM produtos WHERE id=?",[id],(err)=>{

if(err){
return res.status(500).json({error:err});
}

res.json({message:"Produto excluído"});

});

});
module.exports = router;