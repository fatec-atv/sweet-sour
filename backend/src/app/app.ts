import express from "express";
import dotenv from "dotenv";
import router from "../routes"; // Importando as rotas

dotenv.config();

const app = express();
const cors = require('cors');
const PORT = parseInt(process.env.PORT || '3000', 10); // Converte para número
const HOST = '192.168.15.15'; // Adicione esta linha

app.use(express.json()); // Para que o Express entenda JSON
app.use(cors({
  origin: '*', // Permite acesso de qualquer origem
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
}));

// Adicionando uma rota para a raiz
app.get('/', (req, res) => {
  res.send('API está rodando!'); // Mensagem simples para confirmar que a API está ativa
});

app.use(router); // Usando as rotas definidas

app.listen(PORT, HOST, () => { // Adicione o HOST aqui
  console.log(`Server running on http://${HOST}:${PORT}`); // Mensagem de inicialização
});