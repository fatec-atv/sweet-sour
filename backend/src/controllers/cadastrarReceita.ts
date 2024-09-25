import { Request, Response } from "express";
import { db } from "../config";
import Receita from "../interfaces/receita";

const colecaoReceitas = db.collection("receitas");

export const cadastrarReceita = async (req: Request, res: Response) => {
  try {
    const dados: Receita = req.body;

    if (!dados.titulo || !dados.descricao || !dados.ingredientes) {
      return res.status(400).json({ erro: "Dados incompletos!" });
    }

    // Crie um novo objeto com apenas as propriedades necessárias
    const receitaParaAdicionar = {
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
    };

    const novaReceita = await colecaoReceitas.add(receitaParaAdicionar);
    res.status(201).json({ id: novaReceita.id, ...receitaParaAdicionar });
  } catch (erro) {
    console.error(erro); // Adicione um log para ver o erro
    res.status(500).json({ erro: "Falha ao cadastrar receita" });
  }
};

export const listarReceitas = async (req: Request, res: Response) => {
  try {
    const snapshot = await colecaoReceitas.get();
    const receitas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(receitas);
  } catch (erro) {
    res.status(500).json({ erro: "Falha ao listar receitas" });
  }
};

// Obter uma receita específica
export const obterReceita = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const doc = await colecaoReceitas.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ erro: "Receita não encontrada" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (erro) {
    res.status(500).json({ erro: "Falha ao obter receita" });
  }
};

// Atualizar uma receita
export const atualizarReceita = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dados: Receita = req.body;

  try {
    await colecaoReceitas.doc(id).update(dados as any); // Conversão explícita para 'any'
    res.status(200).json({ id, ...dados });
  } catch (erro) {
    res.status(500).json({ erro: "Falha ao atualizar receita" });
  }
};

// Deletar uma receita
export const deletarReceita = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await colecaoReceitas.doc(id).delete();
    res.status(204).send(); // 204 No Content
  } catch (erro) {
    res.status(500).json({ erro: "Falha ao deletar receita" });
  }
};