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

function listarUsuarios(incluirInativos = false) {
  return repositorioSql.listarUsuarios(incluirInativos);
}

function buscarUsuarioPorId(id) {
  return repositorioSql.buscarUsuarioPorId(id);
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

function atualizarUsuario(id, dadosParaAtualizar) {
  return repositorioSql.atualizarUsuario(id, dadosParaAtualizar);
}

function desativarUsuario(id) {
  return repositorioSql.desativarUsuario(id);
}

function atualizarSenha(id, novaSenhaHash) {
  return repositorioSql.atualizarSenha(id, novaSenhaHash);
}

function criarUsuario(data) {
  return repositorioSql.criarUsuario(data);
}

function listarFornecedores(incluirInativos = false) {
  return repositorioSql.listarFornecedores(incluirInativos);
}

function buscarFornecedorPorId(id) {
  return repositorioSql.buscarFornecedorPorId(id);
}

function criarFornecedor(dados) {
  return repositorioSql.criarFornecedor(dados);
}

function listarProdutos(incluirInativos = false) {
  return repositorioSql.listarProdutos(incluirInativos);
}

function listarMovimentacoes(produtoId = null) {
  return repositorioSql.listarMovimentacoes(produtoId);
}

function criarProduto(produtoInput) {
  return repositorioSql.criarProduto(produtoInput);
}

function buscarProdutoPorId(id) {
  return repositorioSql.buscarProdutoPorId(id);
}

function atualizarProduto(id, dadosParaAtualizar) {
  return repositorioSql.atualizarProduto(id, dadosParaAtualizar);
}

function inativarProduto(id) {
  return repositorioSql.inativarProduto(id);
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

function listarAlertas() {
  return repositorioSql.listarAlertas();
}

function adicionarAuditoria(registro) {
  return repositorioSql.adicionarAuditoria(registro);
}

module.exports = {
  state,
  resetState,
  listarUsuarios,
  buscarUsuarioPorId,
  buscarUsuarioPorEmail,
  atualizarStatusLogin,
  atualizarUsuario,
  desativarUsuario,
  atualizarSenha,
  criarUsuario,
  listarFornecedores,
  buscarFornecedorPorId,
  criarFornecedor,
  listarProdutos,
  listarMovimentacoes,
  criarProduto,
  buscarProdutoPorId,
  atualizarProduto,
  inativarProduto,
  atualizarEstoqueProduto,
  adicionarMovimentacao,
  adicionarAlerta,
  listarAlertas,
  adicionarAuditoria
};
