const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, resetState } = require('../src/server');

test.beforeEach(() => resetState());

test('configuração usa o JWT_SECRET do ambiente', () => {
  const config = require('../src/configuracoes');

  assert.equal(config.SECRET, process.env.JWT_SECRET);
});

test('listar usuários não expõe senha_hash na resposta', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  const res = await request(app)
    .get('/api/v1/usuarios')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.dados));
  assert.ok(res.body.dados.some((usuario) => usuario.email === 'gerente@teste.com'));
  assert.equal(res.body.dados[0].senha_hash, undefined);
});

test('login retorna token JWT e bloqueia após três tentativas falhas', async () => {
  const res1 = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'errada' });
  const res2 = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'errada' });
  const res3 = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'errada' });

  assert.equal(res1.status, 401);
  assert.equal(res2.status, 401);
  assert.equal(res3.status, 403);
  assert.match(res3.body.mensagem, /bloqueada/i);
});

test('entrada de estoque exige dados de rastreabilidade corretos para baterias', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  const res = await request(app)
    .post('/api/v1/estoque/entradas')
    .set('Authorization', `Bearer ${token}`)
    .send({
      produto_id: 1,
      quantidade: 2,
      fornecedor_id: 1,
      valor_custo: 100,
      numero_nota_fiscal: 'NF-1',
      itens_rastreaveis: [{ lote: 'LOT-1' }]
    });

  assert.equal(res.status, 400);
  assert.match(res.body.mensagem, /numero_serie|data_validade/i);
});

test('saída rejeita quantidade inválida', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  const res = await request(app)
    .post('/api/v1/estoque/saidas')
    .set('Authorization', `Bearer ${token}`)
    .send({ produto_id: 2, quantidade: -1, destinatario: 'Setor A', motivo: 'Uso interno' });

  assert.equal(res.status, 400);
  assert.match(res.body.mensagem, /número inteiro maior que zero|quantidade/i);
});

test('saída maior que o estoque disponível retorna erro 400', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  const res = await request(app)
    .post('/api/v1/estoque/saidas')
    .set('Authorization', `Bearer ${token}`)
    .send({ produto_id: 2, quantidade: 99, destinatario: 'Setor A', motivo: 'Uso interno' });

  assert.equal(res.status, 400);
  assert.match(res.body.mensagem, /estoque insuficiente|insuficiente/i);
});

test('saída de estoque gera alerta quando estoque atinge o mínimo', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  await request(app)
    .post('/api/v1/estoque/entradas')
    .set('Authorization', `Bearer ${token}`)
    .send({
      produto_id: 2,
      quantidade: 4,
      fornecedor_id: 1,
      valor_custo: 50,
      numero_nota_fiscal: 'NF-2'
    });

  const res = await request(app)
    .post('/api/v1/estoque/saidas')
    .set('Authorization', `Bearer ${token}`)
    .send({ produto_id: 2, quantidade: 4, destinatario: 'Setor A', motivo: 'Uso interno' });

  assert.equal(res.status, 201);
  assert.equal(res.body.dados.alerta_gerado, true);
});

test('ajuste manual rejeita nova_quantidade inválida', async () => {
  const gerenteLogin = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = gerenteLogin.body.dados.token;

  const res = await request(app)
    .post('/api/v1/estoque/ajuste-manual')
    .set('Authorization', `Bearer ${token}`)
    .send({ produto_id: 2, nova_quantidade: -1, justificativa: 'Ajuste inválido' });

  assert.equal(res.status, 400);
  assert.match(res.body.mensagem, /maior ou igual a 0|número/i);
});

test('ajuste manual exige perfil GERENTE e registra auditoria', async () => {
  const gerenteLogin = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = gerenteLogin.body.dados.token;

  const res = await request(app)
    .post('/api/v1/estoque/ajuste-manual')
    .set('Authorization', `Bearer ${token}`)
    .send({ produto_id: 2, nova_quantidade: 12, justificativa: 'Ajuste de inventário' });

  assert.equal(res.status, 201);
  assert.equal(res.body.dados.log_auditoria_registrado, true);
});

test('upload rejeita arquivo maior que 5MB com mensagem clara', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  const res = await request(app)
    .post('/api/v1/uploads/imagens')
    .set('Authorization', `Bearer ${token}`)
    .attach('imagem', Buffer.alloc(6 * 1024 * 1024, 'x'), { filename: 'grande.png', contentType: 'image/png' });

  assert.equal(res.status, 400);
  assert.match(res.body.mensagem, /muito grande|5MB|máximo/i);
});

test('upload rejeita arquivo com mimetype e extensão falsificados', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  const res = await request(app)
    .post('/api/v1/uploads/imagens')
    .set('Authorization', `Bearer ${token}`)
    .attach('imagem', Buffer.from('conteudo-que-nao-e-imagem'), { filename: 'arquivo.png', contentType: 'image/png' });

  assert.equal(res.status, 400);
  assert.match(res.body.mensagem, /imagem|arquivo/i);
});

test('upload de imagem salva arquivo na pasta uploads', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  const pngValido = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAF' +
    'c0C2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJ0UkG' +
    'AAAAAAgI0v9QAAAAASUVORK5CYII=',
    'base64'
  );

  const res = await request(app)
    .post('/api/v1/uploads/imagens')
    .set('Authorization', `Bearer ${token}`)
    .attach('imagem', pngValido, { filename: 'teste.png', contentType: 'image/png' });

  assert.equal(res.status, 201);
  assert.match(res.body.dados.caminho, /\/uploads\//);
});
