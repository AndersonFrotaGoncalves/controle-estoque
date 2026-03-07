const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

/* ======================
LISTAR USUÁRIOS
====================== */

router.get("/", (req, res) => {

    db.query("SELECT id,nome,email,role FROM usuarios", (err, results) => {

        if(err){
            return res.status(500).json({error:err});
        }

        res.json(results);

    });

});


/* ======================
CRIAR USUÁRIO
====================== */

router.post("/", async (req,res)=>{

const {nome,email,senha,role} = req.body;

if(!nome || !email || !senha){
return res.status(400).json({error:"Preencha todos campos"});
}

const hash = await bcrypt.hash(senha,10);

const sql = `
INSERT INTO usuarios (nome,email,senha,role)
VALUES (?,?,?,?)
`;

db.query(sql,[nome,email,hash,role],(err)=>{

if(err){
return res.status(500).json({error:err});
}

res.json({message:"Usuário criado"});

});

});


/* ======================
EDITAR USUÁRIO
====================== */

router.put("/:id", async (req,res)=>{

const {nome,email,role,senha} = req.body;
const {id} = req.params;

let sql;
let valores;

if(senha){

const hash = await bcrypt.hash(senha,10);

sql = `
UPDATE usuarios 
SET nome=?, email=?, role=?, senha=? 
WHERE id=?
`;

valores = [nome,email,role,hash,id];

}else{

sql = `
UPDATE usuarios 
SET nome=?, email=?, role=? 
WHERE id=?
`;

valores = [nome,email,role,id];

}

db.query(sql,valores,(err)=>{

if(err){
return res.status(500).json({error:err});
}

res.json({message:"Usuário atualizado"});

});

});


/* ======================
EXCLUIR USUÁRIO
====================== */

router.delete("/:id",(req,res)=>{

const {id} = req.params;

db.query("DELETE FROM usuarios WHERE id=?",[id],(err)=>{

if(err){
return res.status(500).json({error:err});
}

res.json({message:"Usuário excluído"});

});

});


module.exports = router;