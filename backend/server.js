const express = require("express");
const cors = require("cors");
const path = require("path");

require("./db"); // liga à base de dados (e cria os dados de demonstração na 1.ª vez)
const { verificarToken, apenasAdmin } = require("./middleware/authMiddleware");

const app = express();
app.use(cors());
app.use(express.json());

// estado do serviço (usado pelo Render para saber se o servidor está de pé)
app.get("/health", (req, res) => res.json({ ok: true }));

// ---------- API ----------
// Login é a única rota pública; tudo o resto exige um token válido.
app.use("/auth", require("./routes/auth"));
app.use("/api", verificarToken, require("./routes/produtos"));
app.use("/api", verificarToken, require("./routes/movimentacoes"));
app.use("/api", verificarToken, require("./routes/sap"));
app.use("/importar", verificarToken, apenasAdmin, require("./routes/importar"));
app.use("/usuarios", verificarToken, apenasAdmin, require("./routes/usuarios"));

// ---------- frontend ----------
const FRONTEND = path.join(__dirname, "../frontend");
app.get("/", (req, res) => res.sendFile(path.join(FRONTEND, "login.html")));
app.use(express.static(FRONTEND));

// erros não tratados (ex.: ficheiro demasiado grande no upload)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error.", message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
