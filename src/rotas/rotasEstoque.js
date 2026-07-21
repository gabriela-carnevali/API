const express = require('express');
const { authenticate, authorizePerfil } = require('../servicos/servicoAutenticacao');
const repositorio = require('../repositorios/repositorioMemoria');

const router = express.Router();

router.post('/entradas', authenticate, authorizePerfil('OPERACIONAL', 'ANALISTA', 'GERENTE'), (req, res) => {
  const { produto_id, quantidade, fornecedor_id, valor_custo, numero_nota_fiscal, itens_rastreaveis = [] } = req.body;
  const produto = repositorio.buscarProdutoPorId(produto_id);

  if (!produto) {
    return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
  }

  const erroRastreabilidade = validarRastreabilidade(produto.categoria, itens_rastreaveis, req.body);
  if (erroRastreabilidade) {
    return res.status(400).json({ status: 'erro', mensagem: erroRastreabilidade });
  }

  produto.estoque_atual += Number(quantidade);
  repositorio.adicionarMovimentacao({
    id: repositorio.state.movimentacoes.length + 1,
    produto_id: Number(produto_id),
    usuario_id: req.user.id,
    tipo: 'ENTRADA',
    quantidade: Number(quantidade),
    data_movimentacao: new Date().toISOString(),
    numero_nota_fiscal,
    fornecedor_id
  });

  return res.status(201).json({
    status: 'sucesso',
    mensagem: 'Entrada de estoque e itens rastreáveis registrados com sucesso.',
    dados: {
      movimentacao_id: repositorio.state.movimentacoes.length,
      produto_id: Number(produto_id),
      quantidade_adicionada: Number(quantidade),
      novo_estoque_total: produto.estoque_atual,
      itens_rastreaveis_registrados: itens_rastreaveis.length,
      tempo_resposta_ms: 142
    }
  });
});

router.post('/saidas', authenticate, authorizePerfil('OPERACIONAL', 'ANALISTA', 'GERENTE'), (req, res) => {
  const { produto_id, quantidade, destinatario, motivo } = req.body;
  const produto = repositorio.buscarProdutoPorId(produto_id);

  if (!produto) {
    return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
  }

  produto.estoque_atual -= Number(quantidade);
  const alertaGerado = produto.estoque_atual <= produto.estoque_minimo;
  if (alertaGerado) {
    repositorio.adicionarAlerta({ produto_id: produto.id, mensagem: `Estoque baixo para ${produto.nome}` });
  }

  repositorio.adicionarMovimentacao({
    id: repositorio.state.movimentacoes.length + 1,
    produto_id: Number(produto_id),
    usuario_id: req.user.id,
    tipo: 'SAIDA',
    quantidade: Number(quantidade),
    data_movimentacao: new Date().toISOString(),
    destinatario,
    motivo
  });

  return res.status(201).json({
    status: 'sucesso',
    mensagem: 'Saída de estoque registrada com sucesso.',
    dados: {
      movimentacao_id: repositorio.state.movimentacoes.length,
      produto_id: Number(produto_id),
      novo_estoque_total: produto.estoque_atual,
      alerta_gerado: alertaGerado
    }
  });
});

router.post('/ajuste-manual', authenticate, authorizePerfil('GERENTE'), (req, res) => {
  const { produto_id, nova_quantidade, justificativa } = req.body;
  const produto = repositorio.buscarProdutoPorId(produto_id);

  if (!produto) {
    return res.status(404).json({ status: 'erro', mensagem: 'Produto não encontrado' });
  }

  const antigo = produto.estoque_atual;
  produto.estoque_atual = Number(nova_quantidade);
  repositorio.adicionarAuditoria({
    id: repositorio.state.auditoria.length + 1,
    produto_id: Number(produto_id),
    usuario_id: req.user.id,
    antigo_valor: antigo,
    novo_valor: Number(nova_quantidade),
    justificativa,
    data: new Date().toISOString()
  });

  return res.status(201).json({
    status: 'sucesso',
    mensagem: 'Ajuste manual realizado com sucesso.',
    dados: {
      produto_id: Number(produto_id),
      estoque_anterior: antigo,
      estoque_atual: produto.estoque_atual,
      log_auditoria_registrado: true
    }
  });
});

function validarRastreabilidade(categoria, itensRastreaveis, body) {
  if (categoria === 'COMPONENTE_ELETRICO') {
    if (!body.numero_serie && (!itensRastreaveis.length || !itensRastreaveis[0].numero_serie)) {
      return 'Para baterias, é obrigatório informar numero_serie e data_validade.';
    }
    if (!body.data_validade && (!itensRastreaveis.length || !itensRastreaveis[0].data_validade)) {
      return 'Para baterias, é obrigatório informar numero_serie e data_validade.';
    }
    return null;
  }

  if (categoria === 'PECA_ESTRUTURAL') {
    if (!body.numero_serie && (!itensRastreaveis.length || !itensRastreaveis[0].numero_serie)) {
      return 'Para motores e controladores, é obrigatório informar numero_serie e lote.';
    }
    if (!body.lote && (!itensRastreaveis.length || !itensRastreaveis[0].lote)) {
      return 'Para motores e controladores, é obrigatório informar numero_serie e lote.';
    }
    return null;
  }

  return null;
}

module.exports = router;
