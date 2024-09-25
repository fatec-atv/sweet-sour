import { Router } from "express";
import multer from "multer";
import {
  cadastrarReceita,
  listarReceitas,
  obterReceita,
  atualizarReceita,
  deletarReceita
} from "../controllers/cadastrarReceita";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Rotas de receitas
router.post("/cadastrar/receitas", upload.single('imagem'), cadastrarReceita); 
router.get("/listar/receitas", listarReceitas); 
router.get("/buscar/receitas/:id", obterReceita); 
router.put("/atualizar/receitas/:id", upload.single('imagem'), atualizarReceita); 
router.delete("/deletar/receitas/:id", deletarReceita);

export default router;