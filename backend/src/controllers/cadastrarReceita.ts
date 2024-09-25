import { Request, Response } from "express";
import { db, bucket } from "../config";
import Receita from "../interfaces/receita";
import { v4 as uuidv4 } from 'uuid';

const colecaoReceitas = db.collection("receitas");

export const cadastrarReceita = async (req: Request, res: Response) => {
  try {
    const dados: Receita = JSON.parse(req.body.dados); // Certifique-se de que os dados estão sendo parseados corretamente
    const file = req.file;

    if (!dados.titulo || !dados.descricao || !dados.tempoPreparo || !dados.porcoes || !dados.dificuldade || !dados.categoria || !dados.ingredientes || !dados.modoPreparo)  {
      return res.status(400).json({ erro: "Dados incompletos!" });
    }

    let imageUrl = null;
    if (file) {
      const blob = bucket.file(`images/${uuidv4()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.error(err);
          reject(err);
        });

        blobStream.on('finish', async () => {
          try {
            imageUrl = await blob.getSignedUrl({
              action: 'read',
              expires: '03-01-2500',
            });
            resolve(imageUrl);
          } catch (err) {
            console.error(err);
            reject(err);
          }
        });

        blobStream.end(file.buffer);
      });
    }

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
      imagem: imageUrl ? imageUrl[0] : null,
      created_at: new Date().toLocaleDateString('pt-BR'),
    };

    const novaReceita = await colecaoReceitas.add(receitaParaAdicionar);
    res.status(201).json({ id: novaReceita.id, ...receitaParaAdicionar });
  } catch (erro) {
    console.error(erro);
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

export const atualizarReceita = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dados: Receita = JSON.parse(req.body.dados); // Certifique-se de que os dados estão sendo parseados corretamente
  const file = req.file;

  try {
    let imageUrl = null;
    if (file) {
      const blob = bucket.file(`images/${uuidv4()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.error(err);
          reject(err);
        });

        blobStream.on('finish', async () => {
          try {
            imageUrl = await blob.getSignedUrl({
              action: 'read',
              expires: '03-01-2500',
            });
            resolve(imageUrl);
          } catch (err) {
            console.error(err);
            reject(err);
          }
        });

        blobStream.end(file.buffer);
      });
    }

    const receitaParaAtualizar = {
      ...dados,
      imagem: imageUrl ? imageUrl[0] : dados.imagem,
    };

    await colecaoReceitas.doc(id).update(receitaParaAtualizar as any);
    res.status(200).json({ id, ...receitaParaAtualizar });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao atualizar receita" });
  }
};

export const deletarReceita = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await colecaoReceitas.doc(id).delete();
    res.status(204).send();
  } catch (erro) {
    res.status(500).json({ erro: "Falha ao deletar receita" });
  }
};