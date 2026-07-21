const repositorioSql = require('./repositorioSql');

const state = {
  usuarios: [],
  produtos: [],
  movimentacoes: [],
  alertas: [],
  auditoria: []
};

function seed() {
  repositorioSql.resetarBanco();
  state.usuarios = repositorioSql.listarUsuarios();
  state.produtos = repositorioSql.listarProdutos();
  state.movimentacoes = [];
  state.alertas = [];
  state.auditoria = [];
}

seed();

function resetState() {
  seed();
}

function listarUsuarios() {
  return repositorioSql.listarUsuarios();
}

function buscarUsuarioPorEmail(email) {
  return repositorioSql.buscarUsuarioPorEmail(email);
}

function atualizarStatusLogin(email, tentativasFalhas, bloqueadoUntil) {
  const usuario = repositorioSql.buscarUsuarioPorEmail(email);
  if (!usuario) return null;
  const usuarioEmMemoria = state.usuarios.find((item) => item.email === email);
  if (usuarioEmMemoria) {
    usuarioEmMemoria.tentativas_falhas = tentativasFalhas;
    usuarioEmMemoria.bloqueado_until = bloqueadoUntil;
  }
  return repositorioSql.atualizarStatusLogin(email, tentativasFalhas, bloqueadoUntil);
}

function criarUsuario(data) {
  return repositorioSql.criarUsuario(data);
}

function listarProdutos() {
  return repositorioSql.listarProdutos();
}

function criarProduto(produtoInput) {
  return repositorioSql.criarProduto(produtoInput);
}

function buscarProdutoPorId(id) {
  return repositorioSql.buscarProdutoPorId(id);
}

function atualizarEstoqueProduto(id, novoEstoque) {
  return repositorioSql.atualizarEstoqueProduto(id, novoEstoque);
}

function adicionarMovimentacao(movimentacao) {
  return repositorioSql.adicionarMovimentacao(movimentacao);
}

function adicionarAlerta(alerta) {
  return repositorioSql.adicionarAlerta(alerta);
}

function adicionarAuditoria(registro) {
  return repositorioSql.adicionarAuditoria(registro);
}

module.exports = {
  state,
  resetState,
  listarUsuarios,
  buscarUsuarioPorEmail,
  atualizarStatusLogin,
  criarUsuario,
  listarProdutos,
  criarProduto,
  buscarProdutoPorId,
  atualizarEstoqueProduto,
  adicionarMovimentacao,
  adicionarAlerta,
  adicionarAuditoria
};
