import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadDataFromStorage() {
    try {
      const data = await AsyncStorage.getItem('SweetSourData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar dados do armazenamento local:', error);
      return null;
    }
  }
  