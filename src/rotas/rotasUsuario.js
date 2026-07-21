const express = require('express');
const controladorUsuario = require('../controladores/controladorUsuario');
const { authenticate, authorizePerfil } = require('../servicos/servicoAutenticacao');

const router = express.Router();

router.get('/', authenticate, authorizePerfil('GERENTE'), controladorUsuario.listarUsuarios);
router.post('/', authenticate, authorizePerfil('GERENTE'), controladorUsuario.criarUsuario);

module.exports = router;
