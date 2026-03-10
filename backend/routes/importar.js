const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const db = require("../db");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("arquivo"), (req, res) => {

    try {

        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const dados = XLSX.utils.sheet_to_json(sheet);

        dados.forEach(produto => {

            db.query(
                "INSERT INTO produtos (codigo, descricao, rack, nivel, quantidade, quantidade_minima) VALUES (?,?,?,?,?,?)",
                [
                    produto.codigo,
                    produto.descricao,
                    produto.rack,
                    produto.nivel,
                    produto.quantidade,
                    produto.quantidade_minima || 2
                ]
            );

        });

        res.json({
            message: "Produtos importados com sucesso"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erro ao importar Excel"
        });

    }

});

module.exports = router;