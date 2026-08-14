# API Estoque

API REST para gestão de estoque e rastreabilidade.

## Requisitos

- Node.js
- npm

## Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` na raiz do projeto com a chave secreta do JWT:
   ```bash
   JWT_SECRET=seu_valor_longo_e_aleatorio
   ```
   Use um valor forte e exclusivo para o ambiente local.
3. Inicie a aplicação:
   ```bash
   npm start
   ```

> O arquivo `.env` nunca deve ser enviado para o Git. Ele contém informações sensíveis, como a chave usada para assinar tokens JWT.

## Testes

```bash
npm test
```
