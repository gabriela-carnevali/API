const app = require('./app');
const conexaoBanco = require('./repositorios/conexaoBanco');

function resetState() {
  conexaoBanco.resetarBanco();
}

module.exports = { app, resetState };

if (require.main === module) {
  app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
}
