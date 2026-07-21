const servicoProduto = require('../servicos/servicoProduto');

function listarProdutos(req, res) {
  const produtos = servicoProduto.listarProdutos();
  return res.status(200).json({ status: 'sucesso', dados: produtos });
}

function criarProduto(req, res) {
  const result = servicoProduto.criarProduto(req.body);
  return res.status(result.statusCode).json(result.payload);
}

module.exports = {
  listarProdutos,
  criarProduto
};
