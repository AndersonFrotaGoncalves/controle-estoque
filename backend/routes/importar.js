const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const db = require("../db");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("arquivo"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    try {

        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const dados = XLSX.utils.sheet_to_json(sheet);

        if (!dados.length) {
            return res.status(400).json({ message: "Arquivo vazio" });
        }

        let erros = 0;
        let inseridos = 0;

        dados.forEach(produto => {

            db.query(
                "INSERT INTO produtos (codigo, descricao, rack, nivel, quantidade, quantidade_minima) VALUES (?,?,?,?,?,?)",
                [
                    produto.codigo,
                    produto.descricao,
                    produto.rack,
                    produto.nivel,
                    produto.quantidade || 0,
                    produto.quantidade_minima || 2
                ],
                (err) => {

                    if (err) {
                        console.error("Erro ao inserir:", produto.codigo, err);
                        erros++;
                    } else {
                        inseridos++;
                    }

                }
            );

        });

        // ⏳ pequeno delay para garantir execução
        setTimeout(() => {
            res.json({
                message: "Importação finalizada",
                inseridos,
                erros
            });
        }, 1000);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erro ao importar Excel"
        });

    }

});

module.exports = router;