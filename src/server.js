const app = require('./app');
const { resetState } = require('./repositorios/repositorioMemoria');

module.exports = { app, resetState };

if (require.main === module) {
  app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
}
