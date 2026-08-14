const servicoEstoque = require('../servicos/servicoEstoque');

function listarMovimentacoes(req, res) {
  const { produto_id } = req.query;

  if (produto_id !== undefined && produto_id !== null && produto_id !== '' && Number.isNaN(Number(produto_id))) {
    return res.status(400).json({ status: 'erro', mensagem: 'produto_id deve ser um número válido.' });
  }

  const filtroProdutoId = produto_id === undefined || produto_id === null || produto_id === '' ? null : Number(produto_id);
  const movimentacoes = servicoEstoque.listarMovimentacoes(filtroProdutoId);

  return res.status(200).json({
    status: 'sucesso',
    dados: movimentacoes
  });
}

function listarAlertas(req, res) {
  const alertas = servicoEstoque.listarAlertas();

  return res.status(200).json({
    status: 'sucesso',
    dados: alertas
  });
}

function registrarEntrada(req, res) {
  const { produto_id, quantidade, fornecedor_id, valor_custo, numero_nota_fiscal, itens_rastreaveis = [] } = req.body;
  
  const result = servicoEstoque.registrarEntrada(
    produto_id,
    quantidade,
    fornecedor_id,
    req.user.id,
    numero_nota_fiscal,
    itens_rastreaveis,
    req.body
  );

  return res.status(result.statusCode).json(result.payload);
}

function registrarSaida(req, res) {
  const { produto_id, quantidade, destinatario, motivo } = req.body;

  const result = servicoEstoque.registrarSaida(
    produto_id,
    quantidade,
    destinatario,
    motivo,
    req.user.id
  );

  return res.status(result.statusCode).json(result.payload);
}

function registrarAjusteManual(req, res) {
  const { produto_id, nova_quantidade, justificativa } = req.body;

  const result = servicoEstoque.registrarAjusteManual(
    produto_id,
    nova_quantidade,
    justificativa,
    req.user.id
  );

  return res.status(result.statusCode).json(result.payload);
}

module.exports = {
  listarMovimentacoes,
  listarAlertas,
  registrarEntrada,
  registrarSaida,
  registrarAjusteManual
};
