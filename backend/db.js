// Credenciais lidas de variáveis de ambiente (nunca escrever senhas no código).
// No Railway, as variáveis MYSQL* são criadas automaticamente pelo serviço MySQL.
try { require("dotenv").config(); } catch (e) { /* dotenv é opcional */ }

const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT) || 3306
});

module.exports = db;
