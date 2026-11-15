-- Esquema da base de dados (compatível com SQLite; ver schema.mysql.sql para MySQL)

CREATE TABLE IF NOT EXISTS usuarios (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nome   TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE,
  senha  TEXT NOT NULL,            -- hash bcrypt
  role   TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

CREATE TABLE IF NOT EXISTS produtos (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo            TEXT NOT NULL UNIQUE,
  descricao         TEXT NOT NULL,
  rack              TEXT,
  nivel             TEXT,
  quantidade        INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  quantidade_minima INTEGER NOT NULL DEFAULT 2
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id  INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
  observacao  TEXT,
  usuario     TEXT,
  data        TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_mov_produto ON movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_mov_data ON movimentacoes(data);
