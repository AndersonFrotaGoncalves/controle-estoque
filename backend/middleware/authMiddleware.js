const jwt = require("jsonwebtoken");

const SECRET = "super_chave_secreta_empresa";

function verificarToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token inválido" });
    }

    jwt.verify(token, SECRET, (err, decoded) => {

        if (err) {
            return res.status(403).json({ error: "Token inválido ou expirado" });
        }

        req.usuario = decoded; // id e nivel
        next();
    });
}

module.exports = verificarToken;