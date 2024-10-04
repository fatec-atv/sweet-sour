import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, Platform, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ingredientesData from '../../assets/data/ingredientes.json';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';

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

interface MultiSelectPickerProps {
  label: string;
  items: { label: string; value: string }[];
  selectedItems: string[];
  onValueChange: (selectedItems: string[]) => void;
}

const MultiSelectPicker: React.FC<MultiSelectPickerProps> = ({ label, items, selectedItems, onValueChange }) => {
  const [selected, setSelected] = useState<string[]>(selectedItems);

  const handleSelect = (itemValue: string) => {
    const newSelected = selected.includes(itemValue)
      ? selected.filter((item) => item !== itemValue)
      : [...selected, itemValue];
    setSelected(newSelected);
    onValueChange(newSelected);
  };

  const handleRemove = (itemValue: string) => {
    const newSelected = selected.filter((item) => item !== itemValue);
    setSelected(newSelected);
    onValueChange(newSelected);
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue=""
          style={styles.picker}
          onValueChange={(itemValue) => handleSelect(itemValue)}
        >
          <Picker.Item label={`Selecione ${label.toLowerCase()}`} value="" />
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
      <View style={styles.selectedItemsContainer}>
        {selected.map((item) => {
          const selectedItem = items.find(i => i.value === item);
          return (
            <View key={item} style={styles.selectedItemContainer}>
              <Text style={styles.selectedItem}>{selectedItem ? selectedItem.label : item}</Text>
              <TouchableOpacity onPress={() => handleRemove(item)}>
                <Text style={styles.removeItem}>X</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const CadastroReceita: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [receita, setReceita] = useState<Receita>({
    titulo: '',
    descricao: '',
    tempoPreparo: '',
    porcoes: '',
    dificuldade: '',
    categoria: '',
    restricoesAlimentares: [],
    ingredientes: [],
    modoPreparo: '',
    imagem: null,
    userId: null,
  });

  const [ingredientes, setIngredientes] = useState<{ label: string; value: string }[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('uid');
        if (storedUserId) {
          setUserId(storedUserId);
          console.log('userId recuperado:', storedUserId); // Adicione esta linha
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
        label: produto.name,
        value: produto.id.toString(),
      }));
      setIngredientes(ingredientesDataFormatted);
    };

    fetchIngredientes();
  }, []);

  const handleChange = (name: string, value: any) => {
    setReceita({
      ...receita,
      [name]: value,
    });
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

    if (!result.canceled) {
      handleChange('imagem', result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!receita.titulo || !receita.descricao || !receita.tempoPreparo || !receita.porcoes || !receita.dificuldade || !receita.categoria || receita.ingredientes.length === 0 || !receita.modoPreparo) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    console.log('userId:', userId); // Adicione esta linha

    try {
      const formData = new FormData();
      formData.append('dados', JSON.stringify({
        titulo: receita.titulo,
        descricao: receita.descricao,
        tempoPreparo: receita.tempoPreparo,
        porcoes: receita.porcoes,
        dificuldade: receita.dificuldade,
        categoria: receita.categoria,
        restricoesAlimentares: receita.restricoesAlimentares,
        ingredientes: receita.ingredientes,
        modoPreparo: receita.modoPreparo,
        uid: userId,
      }));

      if (receita.imagem) {
        const filename = receita.imagem.split('/').pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('imagem', {
          uri: receita.imagem,
          name: filename,
          type: type,
        } as any);
      }

      const response = await axios.post(`${API_URL}/cadastrar/receitas`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.id) {
        Alert.alert(
          'Sucesso', 
          'Receita cadastrada com sucesso', 
          [{ text: 'OK',
            onPress: () => navigation.navigate('MinhasReceitas') }] 
        );
      } else {
        alert('Erro ao cadastrar receita: Dados inválidos ou incompletos.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert('Erro ao cadastrar receita: ' + (error.response ? error.response.data.erro : error.message));
      } else {
        alert('Erro ao cadastrar receita: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Receita</Text>
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
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={receita.tempoPreparo}
            style={styles.picker}
            onValueChange={(itemValue) => handleChange('tempoPreparo', itemValue)}
          >
            <Picker.Item label="Selecione o tempo de preparo" value="" />
            <Picker.Item label="15 minutos" value="15 minutos" />
            <Picker.Item label="30 minutos" value="30 minutos" />
            <Picker.Item label="45 minutos" value="45 minutos" />
            <Picker.Item label="1 hora" value="1 hora" />
            <Picker.Item label="1 hora e 30 minutos" value="1 hora e 30 minutos" />
            <Picker.Item label="2 horas" value="2 horas" />
            <Picker.Item label="2 horas e 30 minutos" value="2 horas e 30 minutos" />
            <Picker.Item label="3 horas" value="3 horas" />
            <Picker.Item label="3 horas e 30 minutos" value="3 horas e 30 minutos" />
            <Picker.Item label="4 horas" value="4 horas" />
            <Picker.Item label="4 horas e 30 minutos" value="4 horas e 30 minutos" />
            <Picker.Item label="5 horas" value="5 horas" />
          </Picker>
        </View>
        <Text style={styles.label}>Porções:</Text>
        <TextInput
          style={styles.input}
          placeholder="Porções"
          value={receita.porcoes}
          onChangeText={(text) => handleChange('porcoes', text)}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Dificuldade:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={receita.dificuldade}
            style={styles.picker}
            onValueChange={(itemValue) => handleChange('dificuldade', itemValue)}
          >
            <Picker.Item label="Selecione a dificuldade" value="" />
            <Picker.Item label="Fácil" value="Fácil" />
            <Picker.Item label="Médio" value="Médio" />
            <Picker.Item label="Difícil" value="Difícil" />
          </Picker>
        </View>
        <Text style={styles.label}>Categoria:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={receita.categoria}
            style={styles.picker}
            onValueChange={(itemValue) => handleChange('categoria', itemValue)}
          >
            <Picker.Item label="Selecione a categoria" value="" />
            <Picker.Item label="Entrada" value="Entrada" />
            <Picker.Item label="Prato Principal" value="Prato Principal" />
            <Picker.Item label="Sobremesa" value="Sobremesa" />
          </Picker>
        </View>
        <MultiSelectPicker
          label="Restrições Alimentares"
          items={[
            { label: 'Sem Glúten', value: 'Sem Glúten' },
            { label: 'Sem Lactose', value: 'Sem Lactose' },
            { label: 'Vegetariano', value: 'Vegetariano' },
            { label: 'Vegano', value: 'Vegano' },
          ]}
          selectedItems={receita.restricoesAlimentares}
          onValueChange={(selectedItems) => handleChange('restricoesAlimentares', selectedItems)}
        />
        <MultiSelectPicker
          label="Ingredientes"
          items={ingredientes}
          selectedItems={receita.ingredientes.map((ing) => ing.id)}
          onValueChange={(selectedItems) => {
            const selectedIngredientes = selectedItems.map((id) => ({
              id: id,
              name: ingredientes.find((ing) => ing.value === id)?.label || '',
            }));
            handleChange('ingredientes', selectedIngredientes);
          }}
        />
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
          <Text style={styles.buttonText}>Cadastrar Receita</Text>
        </TouchableOpacity>
      </View>
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
    height: 50,
    borderColor: '#C5C5C5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  textArea: {
    height: 100,
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
  },
  picker: {
    height: 50,
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
});

export default CadastroReceita;