const { Pool } = require("pg");

const db = new Pool({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.jepelzlwnymaqspdwwuh",
  password: "Ae181018frota",
  database: "postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = db;