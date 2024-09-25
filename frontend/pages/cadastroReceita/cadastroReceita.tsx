import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ingredientesData from '../../assets/data/ingredientes.json';
import styles from './styles';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Ingrediente {
  id: string;
  nome: string;
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
  const [receita, setReceita] = useState<Receita>({
    titulo: '',
    descricao: '',
    tempoPreparo: '',
    porcoes: '',
    dificuldade: '',
    categoria: '',
    restricoesAlimentares: [],
    ingredientes: [],
    modoPreparo: ''
  });

  const [ingredientes, setIngredientes] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    // Carregando os ingredientes do JSON local
    const fetchIngredientes = () => {
      const ingredientesDataFormatted = ingredientesData.map((produto) => ({
        label: produto.name, // Usando a propriedade correta 'name'
        value: produto.id.toString(), // Convertendo id para string
      }));
      setIngredientes(ingredientesDataFormatted);
    };

    fetchIngredientes();
  }, []);

  const handleChange = (name: string, value: any) => {
    setReceita({
      ...receita,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      console.log('Enviando dados da receita:', receita);
      const response = await axios.post(`${API_URL}/cadastrar/receitas`, receita);
      console.log('Resposta da API:', response.data);
  
      // Verificando se a resposta contém o ID da nova receita
      if (response.data && response.data.id) {
        alert('Receita cadastrada com sucesso!');
      } else {
        alert('Erro ao cadastrar receita: Dados inválidos ou incompletos.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro ao cadastrar receita:', error.response ? error.response.data : error.message);
        alert('Erro ao cadastrar receita: ' + (error.response ? error.response.data.erro : error.message));
      } else {
        console.error('Erro desconhecido ao cadastrar receita:', error);
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
            { label: 'Vegano', value: 'Vegano' }
          ]}
          selectedItems={receita.restricoesAlimentares}
          onValueChange={(selectedItems) => handleChange('restricoesAlimentares', selectedItems)}
        />
        <MultiSelectPicker
          label="Ingredientes"
          items={ingredientes}
          selectedItems={receita.ingredientes.map(ing => ing.id)}
          onValueChange={(selectedItems) => {
            const selectedIngredientes = selectedItems.map(itemId => {
              const ingrediente = ingredientes.find(ing => ing.value === itemId);
              return ingrediente ? { id: itemId, nome: ingrediente.label } : null;
            }).filter(Boolean) as Ingrediente[];
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

export default CadastroReceita;