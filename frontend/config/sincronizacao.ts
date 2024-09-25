import { saveDataToStorage } from "./asyncStorage";
import { getDataFromFirebase } from "./buscarDadosFirebase";
// import { loadDataFromStorage } from "./carregarDados";

export async function syncData() {

  
    // Caso contrário, busca os dados do Firebase
    const firebaseData = await getDataFromFirebase();
    if (firebaseData) {
      await saveDataToStorage(firebaseData); // Salva os dados e a última data de atualização
      return firebaseData;
    }
    
    return null;
  }
  