import axios from "axios";

export async function getDataFromFirebase() {
    try {
      const [categoriasResponse] = await Promise.all([
        axios.get('http://192.168.113.186:3000/listar/receitas'),
      ]);
      
      return {
        categorias: categoriasResponse.data,
      };
    } catch (error) {
      console.error('Erro ao buscar dados do Firebase:', error);
      return null;
    }
  }
  