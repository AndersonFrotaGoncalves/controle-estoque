const mysql = require("mysql2");

const db = mysql.createPool({
  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "goJcMRFGnYcqYZltvSblgdFwVDmAaNcg",
  database: "railway",
  port: 50021
});

module.exports = db;