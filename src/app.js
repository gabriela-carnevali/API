const express = require('express');
const rotasAutenticacao = require('./rotas/rotasAutenticacao');
const rotasUsuario = require('./rotas/rotasUsuario');
const rotasProduto = require('./rotas/rotasProduto');
const rotasEstoque = require('./rotas/rotasEstoque');
const rotasUpload = require('./rotas/rotasUpload');
const rotasFornecedor = require('./rotas/rotasFornecedor');

const app = express();
app.use(express.json());

app.use('/api/v1/auth', rotasAutenticacao);
app.use('/api/v1/usuarios', rotasUsuario);
app.use('/api/v1/produtos', rotasProduto);
app.use('/api/v1/fornecedores', rotasFornecedor);
app.use('/api/v1/estoque', rotasEstoque);
app.use('/api/v1/uploads', rotasUpload);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'erro', mensagem: 'Erro interno do servidor' });
});

module.exports = app;
