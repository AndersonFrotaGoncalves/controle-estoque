const express = require("express");
const router = express.Router();
const db = require("../db");


// ===============================
// LISTAR
// ===============================
router.get("/aps", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM aps");
        res.json(result.rows); // 🔥 CORREÇÃO
    } catch (err) {
        return res.status(500).json(err);
    }
});


// ===============================
// CRIAR / UPDATE (INDIVIDUAL)
// ===============================
router.post("/aps", async (req, res) => {

    const d = req.body;

    const sql = `
        INSERT INTO aps (
            situacao, numero_ot, data, responsavel,
            cod_local, localizacao, descricao,
            data_manual, disponibilidade, dias_espera,
            documento_compras, pedido_tec, armazem_mrpt,
            observacoes, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)

        ON CONFLICT (numero_ot) DO UPDATE SET
            situacao=EXCLUDED.situacao,
            data=EXCLUDED.data,
            responsavel=EXCLUDED.responsavel,
            cod_local=EXCLUDED.cod_local,
            localizacao=EXCLUDED.localizacao,
            descricao=EXCLUDED.descricao,
            data_manual=EXCLUDED.data_manual,
            disponibilidade=EXCLUDED.disponibilidade,
            dias_espera=EXCLUDED.dias_espera,
            documento_compras=EXCLUDED.documento_compras,
            pedido_tec=EXCLUDED.pedido_tec,
            armazem_mrpt=EXCLUDED.armazem_mrpt,
            observacoes=EXCLUDED.observacoes,
            status=EXCLUDED.status
    `;

    try {
        await db.query(sql, [
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
        ]);

        res.json({ ok: true });

    } catch (err) {
        return res.status(500).json(err);
    }

});


// ===============================
// DELETE
// ===============================
router.delete("/aps/:numero_ot", async (req, res) => {

    const numero_ot = req.params.numero_ot;

    try {
        await db.query(
            "DELETE FROM aps WHERE numero_ot = $1",
            [numero_ot]
        );
        res.json({ ok: true });
    } catch (err) {
        return res.status(500).json(err);
    }

});


// ===============================
// UPDATE
// ===============================
router.put("/aps/:numero_ot", async (req, res) => {

    const numero_ot = req.params.numero_ot;
    const d = req.body;

    const sql = `
        UPDATE aps SET
        situacao=$1, data=$2, responsavel=$3, cod_local=$4, localizacao=$5,
        descricao=$6, data_manual=$7, disponibilidade=$8, dias_espera=$9,
        documento_compras=$10, pedido_tec=$11, armazem_mrpt=$12,
        observacoes=$13, status=$14
        WHERE numero_ot=$15
    `;

    try {
        await db.query(sql, [
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
        ]);

        res.json({ ok: true });

    } catch (err) {
        return res.status(500).json(err);
    }

});


// ===============================
// 🔥 SALVAR EM LOTE
// ===============================
router.post("/aps/lote", async (req, res) => {

  const dados = req.body;

  const sql = `
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
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    ON CONFLICT (numero_ot) DO UPDATE SET
      situacao = EXCLUDED.situacao,
      data = EXCLUDED.data,
      responsavel = EXCLUDED.responsavel,
      cod_local = EXCLUDED.cod_local,
      localizacao = EXCLUDED.localizacao,
      descricao = EXCLUDED.descricao,
      data_manual = EXCLUDED.data_manual,
      disponibilidade = EXCLUDED.disponibilidade,
      dias_espera = EXCLUDED.dias_espera,
      documento_compras = EXCLUDED.documento_compras,
      pedido_tec = EXCLUDED.pedido_tec,
      armazem_mrpt = EXCLUDED.armazem_mrpt,
      observacoes = EXCLUDED.observacoes,
      status = EXCLUDED.status
  `;

  try {

    for (const ap of dados) {

      await db.query(sql, [
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
      ]);

    }

    res.json({ sucesso: true });

  } catch (err) {
    console.error("ERRO SQL:", err);
    res.status(500).json({ erro: "Erro ao salvar" });
  }

});


// ===============================
module.exports = router;