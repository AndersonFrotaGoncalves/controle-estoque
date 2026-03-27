const express = require("express");
const router = express.Router();
const db = require("../db");

// LISTAR
router.get("/aps", (req, res) => {
    db.query("SELECT * FROM aps", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// CRIAR
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
module.exports = router;