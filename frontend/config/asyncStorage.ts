import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveDataToStorage(data: any) {
  try {
    await AsyncStorage.setItem('sweetSourData', JSON.stringify(data)); 
  } catch (error) {
    console.error('Erro ao salvar dados no armazenamento local:', error);
  }
}
