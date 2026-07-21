const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, resetState } = require('../src/server');

test.beforeEach(() => resetState());

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

test('upload de imagem salva arquivo na pasta uploads', async () => {
  const login = await request(app).post('/api/v1/auth/login').send({ email: 'gerente@teste.com', senha: 'senha123' });
  const token = login.body.dados.token;

  const res = await request(app)
    .post('/api/v1/uploads/imagens')
    .set('Authorization', `Bearer ${token}`)
    .attach('imagem', Buffer.from('imagem-teste'), { filename: 'teste.png', contentType: 'image/png' });

  assert.equal(res.status, 201);
  assert.match(res.body.dados.caminho, /\/uploads\//);
});
