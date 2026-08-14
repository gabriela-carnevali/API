CREATE DATABASE IF NOT EXISTS db_bikecity;

USE db_bikecity;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  perfil VARCHAR(50) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  tentativas_falhas INT NOT NULL DEFAULT 0,
  bloqueado_until DATETIME NULL
);

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  codigo_interno VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  unidade_medida VARCHAR(50) NOT NULL,
  localizacao_deposito VARCHAR(255) NOT NULL,
  fornecedor_id INT NULL,
  custo DECIMAL(10,2) NOT NULL,
  dimensoes VARCHAR(255) NULL,
  estoque_atual INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 5,
  estado_montagem VARCHAR(50) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  quantidade INT NOT NULL,
  data_movimentacao DATETIME NOT NULL,
  numero_nota_fiscal VARCHAR(100) NULL,
  numero_pedido VARCHAR(100) NULL,
  destinatario VARCHAR(255) NULL,
  motivo TEXT NULL,
  fornecedor_id INT NULL,
  tipo_transporte VARCHAR(100) NULL
);

CREATE TABLE IF NOT EXISTS alertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  mensagem TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  antigo_valor INT NOT NULL,
  novo_valor INT NOT NULL,
  justificativa TEXT NULL,
  data DATETIME NOT NULL
);

