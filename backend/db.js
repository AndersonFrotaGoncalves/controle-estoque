// Ligação à base de dados.
//
// - Por omissão usa SQLite (módulo node:sqlite, incluído no Node 22.13+):
//   o ficheiro backend/data/estoque.db é criado e preenchido com dados de
//   demonstração no primeiro arranque. Não é preciso instalar nada.
// - Se as variáveis MYSQL* estiverem definidas (ex.: no Railway), usa MySQL.
//
// Os dois modos expõem a mesma interface que o mysql2:
//   db.query(sql, params, (err, resultado) => ...)
// e uma versão com Promises: await db.run(sql, params)
try { require("dotenv").config(); } catch (e) { /* dotenv é opcional */ }

const fs = require("fs");
const path = require("path");

let db;

if (process.env.MYSQLHOST) {
  const mysql = require("mysql2");
  db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: Number(process.env.MYSQLPORT) || 3306,
  });
  db.motor = "mysql";
  db.run = (sql, params = []) => db.promise().query(sql, params).then(([r]) => r);
  console.log("Database: MySQL at", process.env.MYSQLHOST);
} else {
  const { DatabaseSync } = require("node:sqlite");
  const pasta = path.join(__dirname, "data");
  fs.mkdirSync(pasta, { recursive: true });
  const ficheiro = process.env.SQLITE_FILE || path.join(pasta, "estoque.db");
  const novo = !fs.existsSync(ficheiro);
  const sqlite = new DatabaseSync(ficheiro);
  sqlite.exec("PRAGMA foreign_keys = ON;");

  const executar = (sql, params = []) => {
    const stmt = sqlite.prepare(sql);
    if (/^\s*(select|with|pragma)/i.test(sql)) return stmt.all(...params);
    const r = stmt.run(...params);
    // mesmo formato que o mysql2 devolve
    return { insertId: Number(r.lastInsertRowid), affectedRows: r.changes };
  };

  db = {
    motor: "sqlite",
    query(sql, params, cb) {
      if (typeof params === "function") { cb = params; params = []; }
      let erro = null, res;
      try { res = executar(sql, params); } catch (e) { erro = e; }
      setImmediate(() => cb && cb(erro, res));
    },
    run: async (sql, params) => executar(sql, params),
    transacao(fn) {
      sqlite.exec("BEGIN");
      try { const r = fn(executar); sqlite.exec("COMMIT"); return r; }
      catch (e) { sqlite.exec("ROLLBACK"); throw e; }
    },
  };

  sqlite.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
  if (novo) require("./seed")(executar);
  console.log("Database: SQLite at", path.relative(process.cwd(), ficheiro));
}

module.exports = db;
