const mysql = require("mysql2");

const db = mysql.createPool({
  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "SUA_SENHA",
  database: "railway",
  port: 50021,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;