import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, Platform, Image, Modal, FlatList } from 'react-native';
import ingredientesData from '../../assets/data/ingredientes.json';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config';

type RootStackParamList = {
  MinhasReceitas: undefined;
};

interface Ingrediente {
  id: string;
  name: string;
}

interface Receita {
  titulo: string;
  descricao: string;
  tempoPreparo: string;
  porcoes: string;
  dificuldade: string;
  categoria: string;
  restricoesAlimentares: string[];
  ingredientes: Ingrediente[];
  modoPreparo: string;
  imagem: string | null;
  userId: string | null;
}

const EditarReceita: React.FC = ({ route }: any) => {
  const { id } = route.params;
  const [userId, setUserId] = useState<string | null>(null);
  const [receita, setReceita] = useState<Receita | null>(null);
  const [ingredientes, setIngredientes] = useState<{ label: string; value: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPicker, setSelectedPicker] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('uid');
        if (storedUserId) {
          setUserId(storedUserId);
          console.log('userId recuperado:', storedUserId);
        } else {
          console.log('userId não encontrado no AsyncStorage');
        }
      } catch (error) {
        console.error('Erro ao recuperar o userId:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchIngredientes = () => {
      const ingredientesDataFormatted = ingredientesData.map((produto) => ({
        label: produto.nome,
        value: produto.id.toString(),
      }));
      setIngredientes(ingredientesDataFormatted);
    };

    fetchIngredientes();
  }, []);

  useEffect(() => {
    const fetchReceita = async () => {
      try {
        const receitaRef = doc(db, 'receitas', id);
        const receitaSnap = await getDoc(receitaRef);

        if (receitaSnap.exists()) {
          const receitaData = receitaSnap.data() as Receita;
          setReceita(receitaData);
        } else {
          console.log("Receita não encontrada com o ID:", id);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar os detalhes da receita.');
      }
    };

    fetchReceita();
  }, [id]);

  const handleChange = (name: string, value: any) => {
    if (receita) {
      setReceita({
        ...receita,
        [name]: value,
      });
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Desculpe, precisamos da permissão para acessar a galeria!');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && receita) {
      handleChange('imagem', result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!receita || !receita.titulo || !receita.descricao || !receita.tempoPreparo || !receita.porcoes || !receita.dificuldade || !receita.categoria || receita.ingredientes.length === 0 || !receita.modoPreparo) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    console.log('userId:', userId);

    try {
      await updateDoc(doc(db, 'receitas', id), {
        titulo: receita.titulo,
        descricao: receita.descricao,
        tempoPreparo: receita.tempoPreparo,
        porcoes: receita.porcoes,
        dificuldade: receita.dificuldade,
        categoria: receita.categoria,
        restricoesAlimentares: receita.restricoesAlimentares,
        ingredientes: receita.ingredientes,
        modoPreparo: receita.modoPreparo,
        imagem: receita.imagem,
      });

      Alert.alert(
        'Sucesso', 
        'Receita atualizada com sucesso', 
        [{ text: 'OK',
          onPress: () => navigation.navigate('MinhasReceitas') }] 
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a receita.');
    }
  };

  const openModal = (picker: string) => {
    setSelectedPicker(picker);
    setModalVisible(true);
  };

  const renderPickerItems = (items: { label: string; value: string }[]) => (
    <FlatList
      data={items}
      keyExtractor={(item) => item.value}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => {
          if (selectedPicker === 'restricoesAlimentares') {
            const newSelected = receita?.restricoesAlimentares.includes(item.value)
              ? receita.restricoesAlimentares.filter((value) => value !== item.value)
              : [...receita.restricoesAlimentares, item.value];
            handleChange('restricoesAlimentares', newSelected);
          } else if (selectedPicker === 'ingredientes') {
            const newSelected = receita?.ingredientes.some((ing) => ing.id === item.value)
              ? receita.ingredientes.filter((ing) => ing.id !== item.value)
              : [...receita.ingredientes, { id: item.value, name: item.label }];
            handleChange('ingredientes', newSelected);
          } else {
            handleChange(selectedPicker!, item.value);
          }
          setModalVisible(false);
        }}>
          <Text style={styles.pickerItem}>{item.label}</Text>
        </TouchableOpacity>
      )}
    />
  );

  const removeSelectedItem = (type: string, value: string) => {
    if (type === 'restricoesAlimentares') {
      handleChange('restricoesAlimentares', receita?.restricoesAlimentares.filter(item => item !== value));
    } else if (type === 'ingredientes') {
      handleChange('ingredientes', receita?.ingredientes.filter(item => item.id !== value));
    }
  };

  if (!receita) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Receita</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Título:</Text>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={receita.titulo}
          onChangeText={(text) => handleChange('titulo', text)}
        />
        <Text style={styles.label}>Descrição:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição"
          value={receita.descricao}
          onChangeText={(text) => handleChange('descricao', text)}
          multiline={true}
          numberOfLines={4}
        />
        <Text style={styles.label}>Imagem:</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text style={styles.imagePickerText}>Escolher Imagem</Text>
        </TouchableOpacity>
        {receita.imagem && (
          <Image
            source={{ uri: receita.imagem }}
            style={styles.selectedImage}
          />
        )}
        <Text style={styles.label}>Tempo de Preparo:</Text>
        <TouchableOpacity style={styles.pickerContainer} onPress={() => openModal('tempoPreparo')}>
          <Text style={styles.pickerText}>{receita.tempoPreparo || 'Selecione o tempo de preparo'}</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Porções:</Text>
        <TextInput
          style={styles.input}
          placeholder="Porções"
          value={receita.porcoes}
          onChangeText={(text) => handleChange('porcoes', text)}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Dificuldade:</Text>
        <TouchableOpacity style={styles.pickerContainer} onPress={() => openModal('dificuldade')}>
          <Text style={styles.pickerText}>{receita.dificuldade || 'Selecione a dificuldade'}</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Categoria:</Text>
        <TouchableOpacity style={styles.pickerContainer} onPress={() => openModal('categoria')}>
          <Text style={styles.pickerText}>{receita.categoria || 'Selecione a categoria'}</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Restrições Alimentares:</Text>
        <TouchableOpacity style={styles.pickerContainer} onPress={() => openModal('restricoesAlimentares')}>
          <Text style={styles.pickerText}>{receita.restricoesAlimentares.length > 0 ? receita.restricoesAlimentares.join(', ') : 'Selecione as restrições alimentares'}</Text>
        </TouchableOpacity>
        <View style={styles.selectedItemsContainer}>
          {receita.restricoesAlimentares.map((item) => (
            <View key={item} style={styles.selectedItemContainer}>
              <Text style={styles.selectedItem}>{item}</Text>
              <TouchableOpacity onPress={() => removeSelectedItem('restricoesAlimentares', item)}>
                <Text style={styles.removeItem}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <Text style={styles.label}>Ingredientes:</Text>
        <TouchableOpacity style={styles.pickerContainer} onPress={() => openModal('ingredientes')}>
          <Text style={styles.pickerText}>{receita.ingredientes.length > 0 ? receita.ingredientes.map(ing => ing.name).join(', ') : 'Selecione os ingredientes'}</Text>
        </TouchableOpacity>
        <View style={styles.selectedItemsContainer}>
          {receita.ingredientes.map((item) => (
            <View key={item.id} style={styles.selectedItemContainer}>
              <Text style={styles.selectedItem}>{item.name}</Text>
              <TouchableOpacity onPress={() => removeSelectedItem('ingredientes', item.id)}>
                <Text style={styles.removeItem}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <Text style={styles.label}>Modo de Preparo:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Modo de Preparo"
          value={receita.modoPreparo}
          onChangeText={(text) => handleChange('modoPreparo', text)}
          multiline={true}
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Atualizar Receita</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        >
        <View style={styles.modalContainer}>
            <View style={[styles.modalContent, selectedPicker === 'ingredientes' && styles.ingredientesModalContent]}>
            <Text style={styles.modalTitle}>Selecione uma opção</Text>
            {selectedPicker === 'tempoPreparo' && renderPickerItems([
                { label: '15 minutos', value: '15 minutos' },
                { label: '30 minutos', value: '30 minutos' },
                { label: '45 minutos', value: '45 minutos' },
                { label: '1 hora', value: '1 hora' },
                { label: '1 hora e 30 minutos', value: '1 hora e 30 minutos' },
                { label: '2 horas', value: '2 horas' },
                { label: '2 horas e 30 minutos', value: '2 horas e 30 minutos' },
                { label: '3 horas', value: '3 horas' },
                { label: '3 horas e 30 minutos', value: '3 horas e 30 minutos' },
                { label: '4 horas', value: '4 horas' },
                { label: '4 horas e 30 minutos', value: '4 horas e 30 minutos' },
                { label: '5 horas', value: '5 horas' },
            ])}
            {selectedPicker === 'dificuldade' && renderPickerItems([
                { label: 'Fácil', value: 'Fácil' },
                { label: 'Médio', value: 'Médio' },
                { label: 'Difícil', value: 'Difícil' },
            ])}
            {selectedPicker === 'categoria' && renderPickerItems([
                { label: 'Entrada', value: 'Entrada' },
                { label: 'Prato Principal', value: 'Prato Principal' },
                { label: 'Sobremesa', value: 'Sobremesa' },
            ])}
            {selectedPicker === 'restricoesAlimentares' && renderPickerItems([
                { label: 'Sem Glúten', value: 'Sem Glúten' },
                { label: 'Sem Lactose', value: 'Sem Lactose' },
                { label: 'Vegetariano', value: 'Vegetariano' },
                { label: 'Vegano', value: 'Vegano' },
            ])}
            {selectedPicker === 'ingredientes' && (
                <>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar ingredientes"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {renderPickerItems(ingredientes.filter(item => item.label.toLowerCase().includes(searchText.toLowerCase())))}
                </>
            )}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E282A',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    flexDirection: 'column',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#A1A1A1',
  },
  input: {
    height: 40,
    borderColor: '#C5C5C5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  ingredientesModalContent: {
    height: '60%', // Ajuste a altura conforme necessário
    marginTop: '20%',
    marginBottom: '20%',
  },
  searchInput: {
    height: 40,
    borderColor: '#C5C5C5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  textArea: {
    height: 80,
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 10,
  },
  pickerText: {
    fontSize: 16,
    color: '#A1A1A1',
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDD2DD',
    borderRadius: 15,
    padding: 5,
    margin: 5,
    borderColor: '#FC7493',
    borderWidth: 1,
  },
  selectedItem: {
    marginRight: 10,
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#FC7493',
  },
  removeItem: {
    color: '#FC7493',
    fontWeight: 'bold',
    marginRight: 5,
  },
  button: {
    backgroundColor: '#FC7493',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePicker: {
    backgroundColor: '#FC7493',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerItem: {
    padding: 10,
    fontSize: 16,
    color: '#2E282A',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#FC7493',
    padding: 10,
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditarReceita;