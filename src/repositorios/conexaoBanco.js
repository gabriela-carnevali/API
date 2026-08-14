const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const caminhoBanco = path.join(__dirname, "../../database.sqlite");
const caminhoScriptSql = path.join(__dirname, "../../db_bikecity.sql");

class ConexaoBanco {
  constructor() {
    this.db = new DatabaseSync(caminhoBanco);
    this.inicializar();
  }

  inicializar() {
    const scriptSql = fs.readFileSync(caminhoScriptSql, "utf8");
    this.db.exec(scriptSql);
    this.seedDadosIniciais();
  }

  seedDadosIniciais() {
    this.db
      .prepare(
        "INSERT OR IGNORE INTO usuarios (id, nome, email, senha_hash, cargo, perfil, ativo, tentativas_falhas, bloqueado_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        1,
        "Gerente Teste",
        "gerente@teste.com",
        bcrypt.hashSync("senha123", 10),
        "Gerente",
        "GERENTE",
        1,
        0,
        null,
      );

    this.db
      .prepare(
        "INSERT OR IGNORE INTO fornecedores (id, nome, cnpj, contato, ativo) VALUES (?, ?, ?, ?, ?)",
      )
      .run(1, "Fornecedor Padrão", null, "Contato padrão", 1);

    this.db
      .prepare(
        "INSERT OR IGNORE INTO produtos (id, nome, codigo_interno, categoria, unidade_medida, localizacao_deposito, fornecedor_id, custo, dimensoes, estoque_atual, estoque_minimo, estado_montagem, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        1,
        "Bateria X",
        "BAT-001",
        "COMPONENTE_ELETRICO",
        "UN",
        "Setor B",
        1,
        100,
        null,
        0,
        3,
        "NAO_APLICA",
        1,
      );

    this.db
      .prepare(
        "INSERT OR IGNORE INTO produtos (id, nome, codigo_interno, categoria, unidade_medida, localizacao_deposito, fornecedor_id, custo, dimensoes, estoque_atual, estoque_minimo, estado_montagem, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        2,
        "Peça A",
        "PEC-001",
        "PECA_ESTRUTURAL",
        "UN",
        "Setor A",
        1,
        50,
        null,
        4,
        3,
        "NAO_APLICA",
        1,
      );
  }

  resetarBanco() {
    this.db.exec(
      "DELETE FROM movimentacoes; DELETE FROM alertas; DELETE FROM auditoria; DELETE FROM produtos; DELETE FROM usuarios; DELETE FROM fornecedores; DELETE FROM sqlite_sequence WHERE name IN ('usuarios', 'produtos', 'movimentacoes', 'alertas', 'auditoria', 'fornecedores');",
    );
    this.seedDadosIniciais();
  }
  getDb() {
    return this.db;
  }
}

const conexaoInstancia = new ConexaoBanco();
module.exports = conexaoInstancia.db;
