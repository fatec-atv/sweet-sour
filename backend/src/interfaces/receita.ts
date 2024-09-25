export default interface Receita {
    titulo: string;
    descricao: string;
    tempoPreparo: string;
    porcoes: string;
    dificuldade: string;
    categoria: string;
    restricoesAlimentares: string[];
    ingredientes: string[];
    modoPreparo: string;
    created_at: Date;
  }
  