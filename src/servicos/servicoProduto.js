const repositorio = require('../repositorios/repositorioMemoria');

function listarProdutos() {
  return repositorio.listarProdutos();
}

function criarProduto(data) {
  const produto = repositorio.criarProduto(data);
  return {
    statusCode: 201,
    payload: {
      status: 'sucesso',
      mensagem: 'Produto cadastrado com sucesso',
      dados: produto
    }
  };
}

module.exports = {
  listarProdutos,
  criarProduto
};
