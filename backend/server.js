const express = require("express");
const cors = require("cors");

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// IMPORTAR ROTAS
const produtosRoutes = require("./routes/produtos");
const importarRoutes = require("./routes/importar");
const authRoutes = require("./routes/auth");

// ROTAS
app.use("/produtos", produtosRoutes);
app.use("/importar", importarRoutes);
app.use("/auth", authRoutes);

// PORTA
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});