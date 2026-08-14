const servicoProduto = require('../servicos/servicoProduto');

function listarProdutos(req, res) {
  const incluirInativos = req.query.incluirInativos === 'true';
  const produtos = servicoProduto.listarProdutos(incluirInativos);
  return res.status(200).json({ status: 'sucesso', dados: produtos });
}

function buscarProdutoPorId(req, res) {
  const produto = servicoProduto.buscarProdutoPorId(req.params.id);

  if (!produto) {
    return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
  }

  return res.status(200).json({ status: 'sucesso', dados: produto });
}

function atualizarProduto(req, res) {
  const produto = servicoProduto.buscarProdutoPorId(req.params.id);

  if (!produto) {
    return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
  }

  const camposPermitidos = ['nome', 'categoria', 'localizacao_deposito', 'custo', 'estoque_minimo', 'estado_montagem'];
  const dadosParaAtualizar = {};

  for (const campo of camposPermitidos) {
    if (Object.prototype.hasOwnProperty.call(req.body, campo)) {
      dadosParaAtualizar[campo] = req.body[campo];
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'fornecedor_id')) {
    const erroFornecedor = servicoProduto.validarFornecedorExiste(req.body.fornecedor_id);
    if (erroFornecedor) {
      return res.status(400).json({ status: 'erro', mensagem: erroFornecedor });
    }
    dadosParaAtualizar.fornecedor_id = req.body.fornecedor_id;
  }

  const produtoAtualizado = servicoProduto.atualizarProduto(req.params.id, dadosParaAtualizar);
  return res.status(200).json({ status: 'sucesso', mensagem: 'Produto atualizado com sucesso', dados: produtoAtualizado });
}

function inativarProduto(req, res) {
  const produto = servicoProduto.buscarProdutoPorId(req.params.id);

  if (!produto) {
    return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
  }

  const produtoInativado = servicoProduto.inativarProduto(req.params.id);
  return res.status(200).json({ status: 'sucesso', mensagem: 'Produto inativado com sucesso', dados: produtoInativado });
}

function criarProduto(req, res) {
  const result = servicoProduto.criarProduto(req.body);
  return res.status(result.statusCode).json(result.payload);
}

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  inativarProduto,
  criarProduto
};
