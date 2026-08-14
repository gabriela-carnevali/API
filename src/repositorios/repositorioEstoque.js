const conexaoBanco = require('./conexaoBanco');

const db = conexaoBanco.getDb();

function listarMovimentacoes(produtoId = null) {
  const parametros = [];
  let query = 'SELECT * FROM movimentacoes';

  if (produtoId !== null && produtoId !== undefined) {
    query += ' WHERE produto_id = ?';
    parametros.push(Number(produtoId));
  }

  query += ' ORDER BY id DESC';
  return db.prepare(query).all(...parametros);
}

function adicionarMovimentacao(movimentacao) {
  const resultado = db.prepare(
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

function adicionarAlerta(alerta) {
  db.prepare('INSERT INTO alertas (produto_id, mensagem) VALUES (?, ?)').run(alerta.produto_id, alerta.mensagem);
  return alerta;
}

function listarAlertas() {
  return db.prepare('SELECT * FROM alertas ORDER BY id DESC').all();
}

function adicionarAuditoria(registro) {
  db.prepare('INSERT INTO auditoria (produto_id, usuario_id, antigo_valor, novo_valor, justificativa, data) VALUES (?, ?, ?, ?, ?, ?)').run(
    registro.produto_id,
    registro.usuario_id,
    registro.antigo_valor,
    registro.novo_valor,
    registro.justificativa,
    registro.data
  );
  return registro;
}

module.exports = {
  listarMovimentacoes,
  adicionarMovimentacao,
  adicionarAlerta,
  listarAlertas,
  adicionarAuditoria
};
