import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../config';
import ingredientesData from '../../assets/data/ingredientes.json';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Ingrediente {
  id: string;
  name: string;
}

interface IngredienteDespensa {
  id: string;
  name: string;
  quantidade: string;
  unidade: string;
}

const unidadesMedida = ['kg', 'g', 'l', 'ml', 'un'];

const Despensa: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [ingredientes, setIngredientes] = useState<IngredienteDespensa[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIngrediente, setSelectedIngrediente] = useState<Ingrediente | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState(unidadesMedida[0]);
  const [searchText, setSearchText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState<IngredienteDespensa | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('uid');
        if (storedUserId) {
          setUserId(storedUserId);
          loadDespensa(storedUserId);
        } else {
          console.log('userId não encontrado no AsyncStorage');
        }
      } catch (error) {
        console.error('Erro ao recuperar o userId:', error);
      }
    };

    fetchUserId();
  }, []);

  const loadDespensa = async (userId: string) => {
    try {
      const q = query(collection(db, 'despensa'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userDespensa: IngredienteDespensa[] = [];

      querySnapshot.forEach((doc) => {
        const ingrediente = doc.data() as IngredienteDespensa;
        userDespensa.push({ ...ingrediente, id: doc.id });
      });

      setIngredientes(userDespensa);
    } catch (error) {
      console.error('Erro ao carregar a despensa:', error);
    }
  };

  const saveIngrediente = async (ingrediente: IngredienteDespensa) => {
    try {
      if (userId) {
        await addDoc(collection(db, 'despensa'), { ...ingrediente, userId });
      }
    } catch (error) {
      console.error('Erro ao salvar o ingrediente:', error);
    }
  };

  const updateIngrediente = async (ingrediente: IngredienteDespensa) => {
    try {
      if (userId) {
        const docRef = doc(db, 'despensa', ingrediente.id);
        await updateDoc(docRef, { quantidade: ingrediente.quantidade, unidade: ingrediente.unidade });
        loadDespensa(userId);
      }
    } catch (error) {
      console.error('Erro ao atualizar o ingrediente:', error);
    }
  };

  const addIngrediente = () => {
    if (selectedIngrediente && quantidade && unidade) {
      const newIngrediente = { id: selectedIngrediente.id, name: selectedIngrediente.name, quantidade, unidade };
      if (isEditing && editingIngrediente) {
        const updatedIngredientes = ingredientes.map(ingrediente =>
          ingrediente.id === editingIngrediente.id ? { ...ingrediente, quantidade, unidade } : ingrediente
        );
        setIngredientes(updatedIngredientes);
        updateIngrediente({ ...editingIngrediente, quantidade, unidade });
      } else {
        setIngredientes([...ingredientes, newIngrediente]);
        saveIngrediente(newIngrediente);
      }
      setModalVisible(false);
      setSelectedIngrediente(null);
      setQuantidade('');
      setUnidade(unidadesMedida[0]);
      setIsEditing(false);
      setEditingIngrediente(null);
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
  };

  const handleEdit = (ingrediente: IngredienteDespensa) => {
    setIsEditing(true);
    setEditingIngrediente(ingrediente);
    setModalVisible(true);
    setSelectedIngrediente({ id: ingrediente.id, name: ingrediente.name });
    setQuantidade(ingrediente.quantidade);
    setUnidade(ingrediente.unidade);
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Você tem certeza que deseja excluir este ingrediente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => handleDelete(id) },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, 'despensa', id);
      await deleteDoc(docRef);
      setIngredientes(ingredientes.filter(ingrediente => ingrediente.id !== id));
    } catch (error) {
      console.error('Erro ao excluir o ingrediente:', error);
    }
  };

  const renderPickerItems = (items: Ingrediente[]) => (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => setSelectedIngrediente(item)} style={selectedIngrediente?.id === item.id ? styles.pickerItemSelected : null}>
          <Text style={styles.pickerItem}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Despensa</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Adicionar Ingrediente</Text>
        </TouchableOpacity>
        <FlatList
          data={ingredientes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.ingredienteContainer}>
              <Text style={styles.ingredienteText}>{item.name}</Text>
              <Text style={styles.ingredienteText}>{item.quantidade} {item.unidade}</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
                  <Icon name="edit" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconButton}>
                  <Icon name="delete" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{isEditing ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}</Text>
                {selectedIngrediente && (
                  <>
                    <Text style={styles.label}>Quantidade:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Quantidade"
                      value={quantidade}
                      onChangeText={setQuantidade}
                      keyboardType="numeric"
                    />
                    <Text style={styles.label}>Unidade de Medida:</Text>
                    <View style={styles.unidadeContainer}>
                      {unidadesMedida.map((unidadeItem, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setUnidade(unidadeItem)}
                          style={[styles.unidadeButton, unidade === unidadeItem && styles.unidadeButtonSelected]}
                        >
                          <Text style={[styles.unidadeText, unidade === unidadeItem && styles.unidadeTextSelected]}>
                            {unidadeItem}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity style={styles.modalButton} onPress={addIngrediente}>
                      <Text style={styles.modalButtonText}>{isEditing ? 'Atualizar' : 'Adicionar'}</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  addButton: {
    backgroundColor: '#FC7493',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredienteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  ingredienteText: {
    fontSize: 16,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
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
  pickerItem: {
    padding: 10,
    fontSize: 16,
    color: '#2E282A',
  },
  pickerItemSelected: {
    backgroundColor: '#FC7493',
    color: '#fff',
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
  unidadeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  unidadeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 5,
  },
  unidadeButtonSelected: {
    backgroundColor: '#FC7493',
  },
  unidadeText: {
    fontSize: 16,
    color: '#000',
  },
  unidadeTextSelected: {
    fontWeight: 'bold',
    color: '#fff',
  },
  modalButton: {
    backgroundColor: '#FC7493',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#A1A1A1',
    padding: 10,
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Despensa;