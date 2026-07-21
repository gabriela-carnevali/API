const express = require('express');
const upload = require('../configuracoes/multer');
const { authenticate, authorizePerfil } = require('../servicos/servicoAutenticacao');

const router = express.Router();

router.post('/imagens', authenticate, authorizePerfil('OPERACIONAL', 'ANALISTA', 'GERENTE'), upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'erro', mensagem: 'Nenhuma imagem enviada' });
  }

  return res.status(201).json({
    status: 'sucesso',
    mensagem: 'Imagem enviada com sucesso',
    dados: {
      nomeArquivo: req.file.filename,
      caminho: `/uploads/${req.file.filename}`
    }
  });
});

module.exports = router;
