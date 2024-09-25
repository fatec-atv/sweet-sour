import { Request, Response } from "express";
import { db } from "../config";
import Receita from "../interfaces/receita";

const colecaoReceitas = db.collection("receitas");

export const cadastrarReceita = async (req: Request, res: Response) => {
  try {
    const dados: Receita = req.body; 

    // função para converter data no formato DD/MM/YYYY para objeto date
    const parseDate = (dateString: string): Date => {
      const [day, month, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    const novaReceita = await colecaoReceitas.add({
      titulo: dados.titulo,
      descricao: dados.descricao,
      tempoPreparo: dados.tempoPreparo,
      porcoes: dados.porcoes,
      dificuldade: dados.dificuldade,
      categoria: dados.categoria,
      restricoesAlimentares: dados.restricoesAlimentares,
      ingredientes: dados.ingredientes,
      modoPreparo: dados.modoPreparo,
      created_at: new Date(),
    });


    res.status(201).json({ id: novaReceita.id, ...dados }); // Retorna o ID da nova receita e os dados cadastrados
  } catch (erro) {
    res.status(500).json({ erro: "Falha ao cadastrar receita" }); // Trata erros
  }
};