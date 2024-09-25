import { Router } from "express";
import {
  cadastrarReceita,
  listarReceitas,
  obterReceita,
  atualizarReceita,
  deletarReceita
} from "../controllers/cadastrarReceita";

const router = Router();

// Rotas de receitas
router.post("/cadastrar/receitas", cadastrarReceita);
router.get("/listar/receitas", listarReceitas); // Listar todas as receitas
router.get("/buscar/receitas/:id", obterReceita); // Obter uma receita específica
router.put("/atualizar/receitas/:id", atualizarReceita); // Atualizar uma receita
router.delete("/deletar/receitas/:id", deletarReceita); // Deletar uma receita

export default router;