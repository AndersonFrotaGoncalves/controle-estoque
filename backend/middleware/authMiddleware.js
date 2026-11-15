// Autenticação por JWT: o login devolve um token que o frontend envia
// em todos os pedidos no cabeçalho "Authorization: Bearer <token>".
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  // Sem JWT_SECRET definido, gera um segredo aleatório a cada arranque
  // (as sessões terminam quando o servidor reinicia). Em produção, defina-o.
  SECRET = crypto.randomBytes(32).toString("hex");
  console.warn("Warning: JWT_SECRET is not set; using a temporary secret.");
}

const gerarToken = (usuario) =>
  jwt.sign({ id: usuario.id, email: usuario.email, nome: usuario.nome, role: usuario.role }, SECRET, { expiresIn: "8h" });

function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing session. Please sign in." });
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Session expired. Please sign in again." });
    req.usuario = decoded; // { id, email, nome, role }
    next();
  });
}

function apenasAdmin(req, res, next) {
  if (req.usuario?.role !== "admin") {
    return res.status(403).json({ error: "Only administrators can do this." });
  }
  next();
}

module.exports = verificarToken;
module.exports.verificarToken = verificarToken;
module.exports.apenasAdmin = apenasAdmin;
module.exports.gerarToken = gerarToken;
