const repositorioProduto = require('../repositorios/repositorioProduto');
const repositorioFornecedor = require('../repositorios/repositorioFornecedor');

function validarFornecedorExiste(fornecedorId) {
  if (fornecedorId === null || fornecedorId === undefined || fornecedorId === '') {
    return null;
  }

  const fornecedor = repositorioFornecedor.buscarFornecedorPorId(fornecedorId);
  if (!fornecedor) {
    return 'Fornecedor informado não existe.';
  }

  return null;
}

function listarProdutos(incluirInativos = false) {
  return repositorioProduto.listarProdutos(incluirInativos);
}

function buscarProdutoPorId(id) {
  return repositorioProduto.buscarProdutoPorId(id);
}

function atualizarProduto(id, dadosParaAtualizar) {
  return repositorioProduto.atualizarProduto(id, dadosParaAtualizar);
}

function inativarProduto(id) {
  return repositorioProduto.inativarProduto(id);
}

function criarProduto(data) {
  const erroFornecedor = validarFornecedorExiste(data.fornecedor_id);
  if (erroFornecedor) {
    return {
      statusCode: 400,
      payload: { status: 'erro', mensagem: erroFornecedor }
    };
  }

  const produto = repositorioProduto.criarProduto(data);
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
  buscarProdutoPorId,
  atualizarProduto,
  inativarProduto,
  criarProduto,
  validarFornecedorExiste
};
