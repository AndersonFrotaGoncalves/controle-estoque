// Importação de produtos a partir de Excel/CSV.
// Colunas esperadas: codigo, descricao, rack, nivel, quantidade, quantidade_minima.
// Códigos novos são criados; códigos que já existem são atualizados.
const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const db = require("../db");

const router = express.Router();
// o ficheiro fica em memória: nada é gravado no disco do servidor
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const norm = (k) => String(k).normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase().replace(/\s+/g, "_");

router.post("/", upload.single("arquivo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Nenhum ficheiro enviado." });

  let linhas;
  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    linhas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" })
      .map((l) => Object.fromEntries(Object.entries(l).map(([k, v]) => [norm(k), v])));
  } catch (err) {
    return res.status(400).json({ message: "Não foi possível ler o ficheiro. Use .xlsx, .xls ou .csv." });
  }
  if (!linhas.length) return res.status(400).json({ message: "O ficheiro está vazio." });

  let inseridos = 0, atualizados = 0;
  const erros = [];

  // processa linha a linha, esperando cada operação (sem "atrasos" artificiais)
  for (const [i, l] of linhas.entries()) {
    const codigo = String(l.codigo || "").trim().toUpperCase();
    const descricao = String(l.descricao || "").trim();
    if (!codigo || !descricao) { erros.push(`Linha ${i + 2}: falta código ou descrição`); continue; }
    const valores = [descricao, String(l.rack || "").trim().toUpperCase() || null, String(l.nivel ?? "").trim() || null,
      Math.max(0, parseInt(l.quantidade, 10) || 0), parseInt(l.quantidade_minima, 10) || 2];
    try {
      const r = await db.run("UPDATE produtos SET descricao = ?, rack = ?, nivel = ?, quantidade = ?, quantidade_minima = ? WHERE codigo = ?", [...valores, codigo]);
      if (r.affectedRows) atualizados++;
      else {
        await db.run("INSERT INTO produtos (descricao, rack, nivel, quantidade, quantidade_minima, codigo) VALUES (?, ?, ?, ?, ?, ?)", [...valores, codigo]);
        inseridos++;
      }
    } catch (err) {
      erros.push(`Linha ${i + 2} (${codigo}): ${err.message}`);
    }
  }

  res.json({
    message: `Importação concluída: ${inseridos} novos, ${atualizados} atualizados${erros.length ? `, ${erros.length} com erro` : ""}.`,
    inseridos, atualizados, erros,
  });
});

module.exports = router;
