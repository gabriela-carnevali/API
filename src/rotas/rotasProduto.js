const express = require('express');
const controladorProduto = require('../controladores/controladorProduto');
const { authenticate, authorizePerfil } = require('../servicos/servicoAutenticacao');

const router = express.Router();

router.get('/', authenticate, authorizePerfil('OPERACIONAL', 'ANALISTA', 'GERENTE'), controladorProduto.listarProdutos);
router.post('/', authenticate, authorizePerfil('ANALISTA', 'GERENTE'), controladorProduto.criarProduto);

module.exports = router;
