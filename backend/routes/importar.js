const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const db = require("../db");
const verificarToken = require("../middleware/authMiddleware");

const upload = multer({ dest: "uploads/" });

router.post("/", verificarToken, upload.single("arquivo"), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    let dados = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    dados.shift(); // remove cabeçalho

    const sql = `
        INSERT INTO produtos
        (codigo, descricao, rack, nivel, quantidade, quantidade_minima)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    let inseridos = 0;

    async function importarDados() {

    for (const linha of dados) {

        const codigo = String(linha[0] || "").trim();
        const descricao = String(linha[1] || "").trim();
        const rack = String(linha[2] || "").trim();
        const nivel = Number(linha[3]);
        const quantidade = Number(linha[4]) || 0;
        const quantidade_minima = Number(linha[5]) || 2;

        if (!codigo || !descricao || !rack || isNaN(nivel)) {
            console.log("Linha ignorada:", linha);
            continue;
        }

        await new Promise((resolve) => {
            db.query(sql, [
                codigo,
                descricao,
                rack,
                nivel,
                quantidade,
                quantidade_minima
            ], (err) => {

                if (!err) inseridos++;

                resolve();
            });
        });
    }
}

await importarDados();

    res.json({ message: `${inseridos} produtos importados com sucesso!` });

});

module.exports = router;
