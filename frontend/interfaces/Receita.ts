export interface Receita {
  imagem: string | undefined;
  id: string;
  titulo: string;
  descricao: string;
  tempoPreparo: string;
  porcoes: string;
  dificuldade: string;
  categoria: string;
  restricoesAlimentares: string[];
  ingredientes: { id: string; nome: string }[];
  modoPreparo: string;
}