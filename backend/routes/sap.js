// Lê o relatório de stock exportado do SAP e devolve as linhas, sem gravar nada.
// O frontend compara estas quantidades com as do sistema.
const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/sap", upload.single("arquivo"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Nenhum ficheiro enviado." });
  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    res.json(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Não foi possível ler o relatório do SAP." });
  }
});

module.exports = router;
