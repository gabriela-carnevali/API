const repositorio = require('../repositorios/repositorioMemoria');

function listarUsuarios() {
  return repositorio.listarUsuarios();
}

function criarUsuario(data) {
  const existe = repositorio.buscarUsuarioPorEmail(data.email);
  if (existe) {
    return {
      statusCode: 409,
      payload: { status: 'erro', mensagem: 'E-mail já cadastrado' }
    };
  }

  const usuario = repositorio.criarUsuario(data);
  return {
    statusCode: 201,
    payload: {
      status: 'sucesso',
      mensagem: 'Usuário cadastrado com sucesso',
      dados: { id: usuario.id }
    }
  };
}

module.exports = {
  listarUsuarios,
  criarUsuario
};
