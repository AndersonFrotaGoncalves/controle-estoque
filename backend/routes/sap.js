const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");

const upload = multer({ dest: "uploads/" });

router.post("/sap", upload.single("arquivo"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    try {

        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const dados = XLSX.utils.sheet_to_json(sheet);

        // 🔥 NÃO SALVA NO BANCO
        res.json(dados);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erro ao ler Excel SAP"
        });

    }

});

module.exports = router;