const express = require("express");
const router = express.Router();
const db = require("../db");


// ===============================
// LISTAR
// ===============================
router.get("/aps", (req, res) => {
    db.query("SELECT * FROM aps", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


// ===============================
// CRIAR / UPDATE (INDIVIDUAL)
// ===============================
router.post("/aps", (req, res) => {

    const d = req.body;

    const sql = `
        INSERT INTO aps (
            situacao, numero_ot, data, responsavel,
            cod_local, localizacao, descricao,
            data_manual, disponibilidade, dias_espera,
            documento_compras, pedido_tec, armazem_mrpt,
            observacoes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE
            situacao=VALUES(situacao),
            data=VALUES(data),
            responsavel=VALUES(responsavel),
            cod_local=VALUES(cod_local),
            localizacao=VALUES(localizacao),
            descricao=VALUES(descricao),
            data_manual=VALUES(data_manual),
            disponibilidade=VALUES(disponibilidade),
            dias_espera=VALUES(dias_espera),
            documento_compras=VALUES(documento_compras),
            pedido_tec=VALUES(pedido_tec),
            armazem_mrpt=VALUES(armazem_mrpt),
            observacoes=VALUES(observacoes),
            status=VALUES(status)
    `;

    db.query(sql, [
        d.situacao,
        d.numero_ot,
        d.data,
        d.responsavel,
        d.cod_local,
        d.localizacao,
        d.descricao,
        d.data_manual,
        d.disponibilidade,
        d.dias_espera,
        d.documento_compras,
        d.pedido_tec,
        d.armazem_mrpt,
        d.observacoes,
        d.status
    ], (err) => {

        if (err) return res.status(500).json(err);
        res.json({ ok: true });

    });

});


// ===============================
// DELETE
// ===============================
router.delete("/aps/:numero_ot", (req, res) => {

    const numero_ot = req.params.numero_ot;

    db.query("DELETE FROM aps WHERE numero_ot = ?", [numero_ot], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ ok: true });
    });

});


// ===============================
// UPDATE
// ===============================
router.put("/aps/:numero_ot", (req, res) => {

    const numero_ot = req.params.numero_ot;
    const d = req.body;

    const sql = `
        UPDATE aps SET
        situacao=?, data=?, responsavel=?, cod_local=?, localizacao=?,
        descricao=?, data_manual=?, disponibilidade=?, dias_espera=?,
        documento_compras=?, pedido_tec=?, armazem_mrpt=?,
        observacoes=?, status=?
        WHERE numero_ot=?
    `;

    db.query(sql, [
        d.situacao,
        d.data,
        d.responsavel,
        d.cod_local,
        d.localizacao,
        d.descricao,
        d.data_manual,
        d.disponibilidade,
        d.dias_espera,
        d.documento_compras,
        d.pedido_tec,
        d.armazem_mrpt,
        d.observacoes,
        d.status,
        numero_ot
    ], (err) => {

        if (err) return res.status(500).json(err);
        res.json({ ok: true });

    });

});


// ===============================
// 🔥 SALVAR EM LOTE (O MAIS IMPORTANTE)
// ===============================
router.post("/aps/lote", (req, res) => {

  const dados = req.body;

  let total = dados.length;
  let concluido = 0;

  dados.forEach(ap => {

    db.query(`
      INSERT INTO aps (
        numero_ot,
        situacao,
        data,
        responsavel,
        cod_local,
        localizacao,
        descricao,
        data_manual,
        disponibilidade,
        dias_espera,
        documento_compras,
        pedido_tec,
        armazem_mrpt,
        observacoes,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        situacao = VALUES(situacao),
        data = VALUES(data),
        responsavel = VALUES(responsavel),
        cod_local = VALUES(cod_local),
        localizacao = VALUES(localizacao),
        descricao = VALUES(descricao),
        data_manual = VALUES(data_manual),
        disponibilidade = VALUES(disponibilidade),
        dias_espera = VALUES(dias_espera),
        documento_compras = VALUES(documento_compras),
        pedido_tec = VALUES(pedido_tec),
        armazem_mrpt = VALUES(armazem_mrpt),
        observacoes = VALUES(observacoes),
        status = VALUES(status)
    `, [
      ap.numero_ot,
      ap.situacao,
      ap.data,
      ap.responsavel,
      ap.cod_local,
      ap.localizacao,
      ap.descricao,
      ap.data_manual,
      ap.disponibilidade,
      ap.dias_espera,
      ap.documento_compras,
      ap.pedido_tec,
      ap.armazem_mrpt,
      ap.observacoes,
      ap.status
    ], (err) => {

      if (err) {
        console.error("ERRO SQL:", err);
        return res.status(500).json({ erro: "Erro ao salvar" });
      }

      concluido++;

      if (concluido === total) {
        res.json({ sucesso: true });
      }

    });

  });

});


// ✅ EXPORTA NO FINAL
module.exports = router;