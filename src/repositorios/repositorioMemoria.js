const bcrypt = require('bcryptjs');

const state = {
  usuarios: [],
  produtos: [],
  movimentacoes: [],
  alertas: [],
  auditoria: []
};

function seed() {
  state.usuarios = [
    {
      id: 1,
      nome: 'Gerente Teste',
      email: 'gerente@teste.com',
      senha_hash: bcrypt.hashSync('senha123', 10),
      cargo: 'Gerente',
      perfil: 'GERENTE',
      ativo: true,
      tentativas_falhas: 0,
      bloqueado_until: null
    }
  ];

  state.produtos = [
    {
      id: 1,
      nome: 'Bateria X',
      codigo_interno: 'BAT-001',
      categoria: 'COMPONENTE_ELETRICO',
      unidade_medida: 'UN',
      localizacao_deposito: 'Setor B',
      fornecedor_id: 1,
      custo: 100,
      dimensoes: null,
      estoque_atual: 0,
      estoque_minimo: 3,
      estado_montagem: 'NAO_APLICA',
      ativo: true
    },
    {
      id: 2,
      nome: 'Peça A',
      codigo_interno: 'PEC-001',
      categoria: 'PECA_ESTRUTURAL',
      unidade_medida: 'UN',
      localizacao_deposito: 'Setor A',
      fornecedor_id: 1,
      custo: 50,
      dimensoes: null,
      estoque_atual: 4,
      estoque_minimo: 3,
      estado_montagem: 'NAO_APLICA',
      ativo: true
    }
  ];

  state.movimentacoes = [];
  state.alertas = [];
  state.auditoria = [];
}

seed();

function resetState() {
  seed();
}

function listarUsuarios() {
  return state.usuarios;
}

function buscarUsuarioPorEmail(email) {
  return state.usuarios.find((usuario) => usuario.email === email);
}

function criarUsuario({ nome, email, cargo, perfil, senha }) {
  const usuario = {
    id: state.usuarios.length + 1,
    nome,
    email,
    senha_hash: bcrypt.hashSync(senha, 10),
    cargo,
    perfil,
    ativo: true,
    tentativas_falhas: 0,
    bloqueado_until: null
  };

  state.usuarios.push(usuario);
  return usuario;
}

function listarProdutos() {
  return state.produtos;
}

function criarProduto(produtoInput) {
  const produto = {
    id: state.produtos.length + 1,
    ...produtoInput,
    estoque_atual: 0,
    ativo: true
  };

  state.produtos.push(produto);
  return produto;
}

function buscarProdutoPorId(id) {
  return state.produtos.find((produto) => produto.id === Number(id));
}

function adicionarMovimentacao(movimentacao) {
  state.movimentacoes.push(movimentacao);
  return movimentacao;
}

function adicionarAlerta(alerta) {
  state.alertas.push(alerta);
  return alerta;
}

function adicionarAuditoria(registro) {
  state.auditoria.push(registro);
  return registro;
}

module.exports = {
  state,
  resetState,
  listarUsuarios,
  buscarUsuarioPorEmail,
  criarUsuario,
  listarProdutos,
  criarProduto,
  buscarProdutoPorId,
  adicionarMovimentacao,
  adicionarAlerta,
  adicionarAuditoria
};
