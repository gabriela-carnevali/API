const express = require('express');
const controladorEstoque = require('../controladores/controladorEstoque');
const { authenticate, authorizePerfil } = require('../servicos/servicoAutenticacao');

const router = express.Router();

router.get('/movimentacoes', authenticate, authorizePerfil('OPERACIONAL', 'ANALISTA', 'GERENTE'), controladorEstoque.listarMovimentacoes);
router.get('/alertas', authenticate, authorizePerfil('OPERACIONAL', 'ANALISTA', 'GERENTE'), controladorEstoque.listarAlertas);
router.post('/entradas', authenticate, authorizePerfil('OPERACIONAL', 'ANALISTA', 'GERENTE'), controladorEstoque.registrarEntrada);
router.post('/saidas', authenticate, authorizePerfil('OPERACIONAL', 'ANALISTA', 'GERENTE'), controladorEstoque.registrarSaida);
router.post('/ajuste-manual', authenticate, authorizePerfil('GERENTE'), controladorEstoque.registrarAjusteManual);

module.exports = router;
