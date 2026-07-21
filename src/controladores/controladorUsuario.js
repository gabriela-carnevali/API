const servicoUsuario = require('../servicos/servicoUsuario');

function listarUsuarios(req, res) {
  const usuarios = servicoUsuario.listarUsuarios();
  return res.status(200).json({ status: 'sucesso', dados: usuarios });
}

function criarUsuario(req, res) {
  const result = servicoUsuario.criarUsuario(req.body);
  return res.status(result.statusCode).json(result.payload);
}

module.exports = {
  listarUsuarios,
  criarUsuario
};
