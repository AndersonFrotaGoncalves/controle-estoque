# Controle de Estoque

Sistema web para controlo de stock de peças num armazém: mapa de localização por racks, cadastro de materiais, movimentações, importação de relatórios do SAP e gestão de utilizadores.

Foi a primeira versão do sistema que hoje uso em produção (com Firebase). Esta versão tem back-end próprio em Node.js e base de dados MySQL.

## Funcionalidades

- **Login** com níveis de acesso e gestão de utilizadores
- **Dashboard** com o resumo do stock
- **Mapa de racks**: posição de cada peça por rack e nível
- **Cadastro** de materiais
- **Movimentações** de entrada e saída
- **Importação SAP**: upload do relatório em Excel/CSV e cruzamento com o stock do sistema

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | HTML, CSS, JavaScript |
| Back-end | Node.js, Express |
| Base de dados | MySQL (`mysql2`) |
| Autenticação | JWT, bcrypt |
| Uploads | Multer, csv-parser |

## Estrutura

```
backend/
  server.js            # API Express
  db.js                # ligação ao MySQL (variáveis de ambiente)
  routes/              # rotas: SAP, importação, ...
  middleware/          # autenticação JWT
frontend/
  *.html, css/, js/    # páginas: login, dashboard, mapa, cadastro, movimentação, SAP, utilizadores
```

## Como correr localmente

```bash
cd backend
npm install
cp ../.env.example .env   # preencher com os dados do MySQL e um JWT_SECRET
node server.js
```

Depois abrir `frontend/index.html` no browser.

## Autor

**Anderson Frota** · [andersonfrota.netlify.app](https://andersonfrota.netlify.app) · [LinkedIn](https://www.linkedin.com/in/andersongfrota)
