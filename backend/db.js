const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "frota1234", // coloque sua senha se tiver
    database: "estoque"
});

db.connect((err) => {
    if (err) {
        console.log("Erro MySQL:", err);
    } else {
        console.log("MySQL conectado");
    }
});

module.exports = db;