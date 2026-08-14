const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const caminhoBanco = path.join(__dirname, '../../database.sqlite');
const caminhoScriptSql = path.join(__dirname, '../../db_bikecity.sql');

class RepositorioSql {
  constructor() {
    this.db = new DatabaseSync(caminhoBanco);
    this.inicializar();
  }

  inicializar() {
    const scriptSql = fs.readFileSync(caminhoScriptSql, 'utf8');
    this.db.exec(scriptSql);
    this.seedDadosIniciais();
  }

  seedDadosIniciais() {
    this.db.prepare(
      "INSERT OR IGNORE INTO usuarios (id, nome, email, senha_hash, cargo, perfil, ativo, tentativas_falhas, bloqueado_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      1,
      'Gerente Teste',
      'gerente@teste.com',
      bcrypt.hashSync('senha123', 10),
      'Gerente',
      'GERENTE',
      1,
      0,
      null
    );

    this.db.prepare(
      "INSERT OR IGNORE INTO fornecedores (id, nome, cnpj, contato, ativo) VALUES (?, ?, ?, ?, ?)"
    ).run(
      1,
      'Fornecedor Padrão',
      null,
      'Contato padrão',
      1
    );

    this.db.prepare(
      "INSERT OR IGNORE INTO produtos (id, nome, codigo_interno, categoria, unidade_medida, localizacao_deposito, fornecedor_id, custo, dimensoes, estoque_atual, estoque_minimo, estado_montagem, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      1,
      'Bateria X',
      'BAT-001',
      'COMPONENTE_ELETRICO',
      'UN',
      'Setor B',
      1,
      100,
      null,
      0,
      3,
      'NAO_APLICA',
      1
    );

    this.db.prepare(
      "INSERT OR IGNORE INTO produtos (id, nome, codigo_interno, categoria, unidade_medida, localizacao_deposito, fornecedor_id, custo, dimensoes, estoque_atual, estoque_minimo, estado_montagem, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      2,
      'Peça A',
      'PEC-001',
      'PECA_ESTRUTURAL',
      'UN',
      'Setor A',
      1,
      50,
      null,
      4,
      3,
      'NAO_APLICA',
      1
    );
  }

  resetarBanco() {
    this.db.exec('DELETE FROM movimentacoes; DELETE FROM alertas; DELETE FROM auditoria; DELETE FROM produtos; DELETE FROM usuarios; DELETE FROM fornecedores; DELETE FROM sqlite_sequence WHERE name IN (\'usuarios\', \'produtos\', \'movimentacoes\', \'alertas\', \'auditoria\', \'fornecedores\');');
    this.seedDadosIniciais();
  }

  listarUsuarios(incluirInativos = false) {
    const query = incluirInativos ? 'SELECT * FROM usuarios ORDER BY id' : 'SELECT * FROM usuarios WHERE ativo = 1 ORDER BY id';
    return this.db.prepare(query).all().map((usuario) => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      perfil: usuario.perfil,
      ativo: Boolean(usuario.ativo)
    }));
  }

  buscarUsuarioPorId(id) {
    const usuario = this.db.prepare('SELECT * FROM usuarios WHERE id = ?').get(Number(id));
    if (!usuario) return null;
    return {
      ...usuario,
      ativo: Boolean(usuario.ativo),
      bloqueado_until: usuario.bloqueado_until ? new Date(usuario.bloqueado_until) : null
    };
  }

  buscarUsuarioPorEmail(email) {
    const usuario = this.db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    if (!usuario) return null;
    return {
      ...usuario,
      ativo: Boolean(usuario.ativo),
      bloqueado_until: usuario.bloqueado_until ? new Date(usuario.bloqueado_until) : null
    };
  }

  atualizarStatusLogin(email, tentativasFalhas, bloqueadoUntil) {
    this.db.prepare('UPDATE usuarios SET tentativas_falhas = ?, bloqueado_until = ? WHERE email = ?').run(tentativasFalhas, bloqueadoUntil, email);
    return this.buscarUsuarioPorEmail(email);
  }

  atualizarUsuario(id, dadosParaAtualizar) {
    const campos = [];
    const valores = [];

    const camposPermitidos = ['nome', 'email', 'cargo', 'perfil'];
    for (const campo of camposPermitidos) {
      if (Object.prototype.hasOwnProperty.call(dadosParaAtualizar, campo)) {
        campos.push(`${campo} = ?`);
        valores.push(dadosParaAtualizar[campo]);
      }
    }

    if (!campos.length) {
      return this.buscarUsuarioPorId(id);
    }

    valores.push(Number(id));
    this.db.prepare(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`).run(...valores);
    return this.buscarUsuarioPorId(id);
  }

  desativarUsuario(id) {
    this.db.prepare('UPDATE usuarios SET ativo = 0 WHERE id = ?').run(Number(id));
    return this.buscarUsuarioPorId(id);
  }

  atualizarSenha(id, novaSenhaHash) {
    this.db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(novaSenhaHash, Number(id));
    return this.buscarUsuarioPorId(id);
  }

  criarUsuario({ nome, email, cargo, perfil, senha }) {
    const senhaHash = bcrypt.hashSync(senha, 10);
    const resultado = this.db.prepare(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo, perfil, ativo, tentativas_falhas, bloqueado_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?)' 
    ).run(nome, email, senhaHash, cargo, perfil, 1, 0, null);

    return {
      id: resultado.lastInsertRowid,
      nome,
      email,
      senha_hash: senhaHash,
      cargo,
      perfil,
      ativo: true,
      tentativas_falhas: 0,
      bloqueado_until: null
    };
  }

  listarFornecedores(incluirInativos = false) {
    const query = incluirInativos ? 'SELECT * FROM fornecedores ORDER BY id' : 'SELECT * FROM fornecedores WHERE ativo = 1 ORDER BY id';
    return this.db.prepare(query).all().map((fornecedor) => ({
      ...fornecedor,
      ativo: Boolean(fornecedor.ativo)
    }));
  }

  buscarFornecedorPorId(id) {
    const fornecedor = this.db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(Number(id));
    if (!fornecedor) return null;
    return {
      ...fornecedor,
      ativo: Boolean(fornecedor.ativo)
    };
  }

  criarFornecedor(dados) {
    const resultado = this.db.prepare(
      'INSERT INTO fornecedores (nome, cnpj, contato, ativo) VALUES (?, ?, ?, ?)' 
    ).run(dados.nome, dados.cnpj ?? null, dados.contato ?? null, 1);

    return {
      id: resultado.lastInsertRowid,
      nome: dados.nome,
      cnpj: dados.cnpj ?? null,
      contato: dados.contato ?? null,
      ativo: true
    };
  }

  listarProdutos(incluirInativos = false) {
    const query = incluirInativos ? 'SELECT * FROM produtos ORDER BY id' : 'SELECT * FROM produtos WHERE ativo = 1 ORDER BY id';
    return this.db.prepare(query).all().map((produto) => ({
      ...produto,
      ativo: Boolean(produto.ativo)
    }));
  }

  listarMovimentacoes(produtoId = null) {
    const parametros = [];
    let query = 'SELECT * FROM movimentacoes';

    if (produtoId !== null && produtoId !== undefined) {
      query += ' WHERE produto_id = ?';
      parametros.push(Number(produtoId));
    }

    query += ' ORDER BY id DESC';
    return this.db.prepare(query).all(...parametros);
  }

  criarProduto(produtoInput) {
    const resultado = this.db.prepare(
      'INSERT INTO produtos (nome, codigo_interno, categoria, unidade_medida, localizacao_deposito, fornecedor_id, custo, dimensoes, estoque_atual, estoque_minimo, estado_montagem, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' 
    ).run(
      produtoInput.nome,
      produtoInput.codigo_interno,
      produtoInput.categoria,
      produtoInput.unidade_medida,
      produtoInput.localizacao_deposito,
      produtoInput.fornecedor_id ?? null,
      produtoInput.custo,
      produtoInput.dimensoes ?? null,
      0,
      produtoInput.estoque_minimo ?? 5,
      produtoInput.estado_montagem,
      1
    );

    return {
      id: resultado.lastInsertRowid,
      ...produtoInput,
      estoque_atual: 0,
      ativo: true
    };
  }

  buscarProdutoPorId(id) {
    const produto = this.db.prepare('SELECT * FROM produtos WHERE id = ?').get(Number(id));
    if (!produto) return null;
    return {
      ...produto,
      ativo: Boolean(produto.ativo)
    };
  }

  atualizarProduto(id, dadosParaAtualizar) {
    const campos = [];
    const valores = [];

    const camposPermitidos = ['nome', 'categoria', 'localizacao_deposito', 'custo', 'estoque_minimo', 'estado_montagem', 'imagem_url'];
    for (const campo of camposPermitidos) {
      if (Object.prototype.hasOwnProperty.call(dadosParaAtualizar, campo)) {
        campos.push(`${campo} = ?`);
        valores.push(dadosParaAtualizar[campo]);
      }
    }

    if (!campos.length) {
      return this.buscarProdutoPorId(id);
    }

    valores.push(Number(id));
    this.db.prepare(`UPDATE produtos SET ${campos.join(', ')} WHERE id = ?`).run(...valores);
    return this.buscarProdutoPorId(id);
  }

  inativarProduto(id) {
    this.db.prepare('UPDATE produtos SET ativo = 0 WHERE id = ?').run(Number(id));
    return this.buscarProdutoPorId(id);
  }

  atualizarEstoqueProduto(id, novoEstoque) {
    this.db.prepare('UPDATE produtos SET estoque_atual = ? WHERE id = ?').run(novoEstoque, Number(id));
    return this.buscarProdutoPorId(id);
  }

  adicionarMovimentacao(movimentacao) {
    const resultado = this.db.prepare(
      'INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, numero_nota_fiscal, numero_pedido, destinatario, motivo, fornecedor_id, tipo_transporte) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' 
    ).run(
      movimentacao.produto_id,
      movimentacao.usuario_id,
      movimentacao.tipo,
      movimentacao.quantidade,
      movimentacao.data_movimentacao,
      movimentacao.numero_nota_fiscal ?? null,
      movimentacao.numero_pedido ?? null,
      movimentacao.destinatario ?? null,
      movimentacao.motivo ?? null,
      movimentacao.fornecedor_id ?? null,
      movimentacao.tipo_transporte ?? null
    );

    return { id: resultado.lastInsertRowid, ...movimentacao };
  }

  adicionarAlerta(alerta) {
    this.db.prepare('INSERT INTO alertas (produto_id, mensagem) VALUES (?, ?)').run(alerta.produto_id, alerta.mensagem);
    return alerta;
  }

  listarAlertas() {
    return this.db.prepare('SELECT * FROM alertas ORDER BY id DESC').all();
  }

  adicionarAuditoria(registro) {
    this.db.prepare('INSERT INTO auditoria (produto_id, usuario_id, antigo_valor, novo_valor, justificativa, data) VALUES (?, ?, ?, ?, ?, ?)').run(
      registro.produto_id,
      registro.usuario_id,
      registro.antigo_valor,
      registro.novo_valor,
      registro.justificativa,
      registro.data
    );
    return registro;
  }
}

module.exports = new RepositorioSql();
