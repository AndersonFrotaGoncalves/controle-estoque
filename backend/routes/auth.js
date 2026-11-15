const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { gerarToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const senha = String(req.body?.senha || "");
  if (!email || !senha) return res.status(400).json({ error: "Preencha o e-mail e a senha." });

  try {
    const [usuario] = await db.run("SELECT * FROM usuarios WHERE email = ?", [email]);
    // mesma mensagem nos dois casos, para não revelar que e-mails existem
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }
    res.json({
      token: gerarToken(usuario),
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no servidor." });
  }
});

module.exports = router;
