import { Router } from "express";
import { cadastrarReceita } from "../controllers/cadastrarReceita";

const router = Router();

router.post("/cadastro/receitas", cadastrarReceita) 

export default router;