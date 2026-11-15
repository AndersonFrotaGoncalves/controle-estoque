-- Esquema equivalente para MySQL (usado quando as variáveis MYSQL* estão definidas)

CREATE TABLE IF NOT EXISTS usuarios (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nome   VARCHAR(100) NOT NULL,
  email  VARCHAR(150) NOT NULL UNIQUE,
  senha  VARCHAR(100) NOT NULL,
  role   ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS produtos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  codigo            VARCHAR(50) NOT NULL UNIQUE,
  descricao         VARCHAR(200) NOT NULL,
  rack              VARCHAR(10),
  nivel             VARCHAR(10),
  quantidade        INT NOT NULL DEFAULT 0,
  quantidade_minima INT NOT NULL DEFAULT 2
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  produto_id  INT NOT NULL,
  tipo        ENUM('entrada', 'saida') NOT NULL,
  quantidade  INT NOT NULL,
  observacao  VARCHAR(255),
  usuario     VARCHAR(150),
  data        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  INDEX idx_mov_data (data)
);
