export default interface Receita {
    titulo: string;
    descricao: string;
    tempoPreparo: number;
    porcoes: number;
    dificuldade: string;
    categoria: string;
    restricoesAlimentares: string[];
    ingredientes: string[];
    modoPreparo: string;
    created_at: string;
  }