import { Request, Response } from "express";
import { db } from "../config";
import Receita from "../interfaces/receita"; 

const colecaoReceitas = db.collection("receitas");

export const listarReceitas = async (req: Request, res: Response): Promise<void> => {
  try {
    const receitasSnapshot = await colecaoReceitas.get(); 
    const receitas = receitasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Receita, 'id'>
    }));

    res.status(200).json(receitas);
  } catch (erro) {
    res.status(500).json({ erro: "Falha ao listar receitas" });
  }
};