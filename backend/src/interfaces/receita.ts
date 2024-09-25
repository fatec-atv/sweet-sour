export default interface Receita {
  titulo: string;
  descricao: string;
  tempoPreparo: string;
  porcoes: string;
  dificuldade: string;
  categoria: string;
  restricoesAlimentares: string[];
  ingredientes: { id: string; name: string }[]; 
  modoPreparo: string;
  imagem: string | null;
  created_at?: Date; 
}
