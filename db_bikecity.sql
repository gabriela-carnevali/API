CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  cargo TEXT NOT NULL,
  perfil TEXT NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  tentativas_falhas INTEGER NOT NULL DEFAULT 0,
  bloqueado_until TEXT
);

CREATE TABLE IF NOT EXISTS fornecedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  contato TEXT,
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  codigo_interno TEXT NOT NULL UNIQUE,
  categoria TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  localizacao_deposito TEXT NOT NULL,
  fornecedor_id INTEGER,
  custo REAL NOT NULL,
  dimensoes TEXT,
  estoque_atual INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 5,
  estado_montagem TEXT NOT NULL,
  imagem_url TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  data_movimentacao TEXT NOT NULL,
  numero_nota_fiscal TEXT,
  numero_pedido TEXT,
  destinatario TEXT,
  motivo TEXT,
  fornecedor_id INTEGER,
  tipo_transporte TEXT,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);

CREATE TABLE IF NOT EXISTS alertas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER NOT NULL,
  mensagem TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  antigo_valor INTEGER NOT NULL,
  novo_valor INTEGER NOT NULL,
  justificativa TEXT,
  data TEXT NOT NULL
);