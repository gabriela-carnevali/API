const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { SECRET } = require('../configuracoes');
const repositorio = require('../repositorios/repositorioMemoria');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ status: 'erro', mensagem: 'Token ausente' });
  }

  try {
    const payload = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ status: 'erro', mensagem: 'Token inválido' });
  }
}

function authorizePerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.user.perfil)) {
      return res.status(403).json({ status: 'erro', mensagem: 'Permissão insuficiente' });
    }
    return next();
  };
}

function createToken(usuario) {
  return jwt.sign({ id: usuario.id, perfil: usuario.perfil, email: usuario.email }, SECRET, { expiresIn: '30m' });
}

function loginUser(email, senha) {
  const usuario = repositorio.buscarUsuarioPorEmail(email);

  if (!usuario) {
    return { statusCode: 401, payload: { status: 'erro', mensagem: 'Credenciais inválidas' } };
  }

  if (usuario.bloqueado_until && new Date(usuario.bloqueado_until) > new Date()) {
    return { statusCode: 403, payload: { status: 'erro', mensagem: 'Conta temporariamente bloqueada' } };
  }

  const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
  if (!senhaValida) {
    usuario.tentativas_falhas += 1;
    if (usuario.tentativas_falhas >= 3) {
      usuario.bloqueado_until = new Date(Date.now() + 15 * 60 * 1000);
      usuario.tentativas_falhas = 0;
      return { statusCode: 403, payload: { status: 'erro', mensagem: 'Conta temporariamente bloqueada' } };
    }
    return { statusCode: 401, payload: { status: 'erro', mensagem: 'Credenciais inválidas' } };
  }

  usuario.tentativas_falhas = 0;
  usuario.bloqueado_until = null;

  return {
    statusCode: 200,
    payload: {
      status: 'sucesso',
      mensagem: 'Login realizado com sucesso',
      dados: { token: createToken(usuario) }
    }
  };
}

module.exports = {
  authenticate,
  authorizePerfil,
  loginUser
};
