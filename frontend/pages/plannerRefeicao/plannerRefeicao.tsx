import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, StyleSheet, Keyboard, TouchableWithoutFeedback, ScrollView, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../config'; // Certifique-se de ter o arquivo de configuração do Firebase

interface DateObject {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface Meal {
  id: string;
  name: string;
  description: string;
  userId: string;
  date: string;
  receitas: Receita[];
}

interface Receita {
  id: string;
  titulo: string;
  descricao: string;
  ingredientes: Ingrediente[];
}

interface Ingrediente {
  id: string;
  name: string;
}

interface DayMeals {
  [date: string]: Meal[];
}

interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
}

const PlannerRefeicao: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [meals, setMeals] = useState<DayMeals>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [selectedPicker, setSelectedPicker] = useState<string | null>(null);
  const [selectedReceitas, setSelectedReceitas] = useState<Receita[]>([]);
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('uid');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Erro ao recuperar o userId:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchMeals = async () => {
      if (!userId) return;

      try {
        const q = query(collection(db, 'meals'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const userMeals: DayMeals = {};

        querySnapshot.forEach((doc) => {
          const meal = doc.data() as Meal;
          const date = meal.date;
          if (!userMeals[date]) {
            userMeals[date] = [];
          }
          userMeals[date].push({ ...meal, id: doc.id });
        });

        setMeals(userMeals);
      } catch (error) {
        console.error('Erro ao recuperar as refeições:', error);
      }
    };

    fetchMeals();
  }, [userId]);

  useEffect(() => {
    const fetchReceitas = async () => {
      try {
        const q = query(collection(db, 'receitas'));
        const querySnapshot = await getDocs(q);
        const listaReceitas: Receita[] = [];

        querySnapshot.forEach((doc) => {
          const receita = doc.data() as Receita;
          listaReceitas.push({ ...receita, id: doc.id });
        });

        setReceitas(listaReceitas);
      } catch (error) {
        console.error('Erro ao recuperar as receitas:', error);
      }
    };

    fetchReceitas();
  }, []);

  const saveMeal = async (meal: Omit<Meal, 'id'>) => {
    try {
      await addDoc(collection(db, 'meals'), meal);
    } catch (error) {
      console.error('Erro ao salvar a refeição:', error);
    }
  };

  const updateMealInFirestore = async (meal: Meal) => {
    try {
      const mealDoc = doc(db, 'meals', meal.id);
      await updateDoc(mealDoc, {
        name: meal.name,
        description: meal.description,
        userId: meal.userId,
        date: meal.date,
        receitas: meal.receitas,
      });
    } catch (error) {
      console.error('Erro ao atualizar a refeição:', error);
    }
  };

  const deleteMealFromFirestore = async (mealId: string) => {
    try {
      const mealDoc = doc(db, 'meals', mealId);
      await deleteDoc(mealDoc);
    } catch (error) {
      console.error('Erro ao excluir a refeição:', error);
    }
  };

  const addMeal = () => {
    if (!mealName || !mealDescription) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }

    const newMeal: Meal = {
      id: '',
      name: mealName,
      description: mealDescription,
      userId: userId,
      date: selectedDate,
      receitas: selectedReceitas,
    };

    const updatedMeals = {
      ...meals,
      [selectedDate]: meals[selectedDate] ? [...meals[selectedDate], newMeal] : [newMeal],
    };

    setMeals(updatedMeals);
    saveMeal(newMeal);
    setModalVisible(false);
    setMealName('');
    setMealDescription('');
    setEditingMeal(null);
    setSelectedReceitas([]);
  };

  const editMeal = (meal: Meal) => {
    setMealName(meal.name);
    setMealDescription(meal.description);
    setEditingMeal(meal);
    setSelectedReceitas(meal.receitas);
    setModalVisible(true);
  };

  const updateMeal = () => {
    if (!mealName || !mealDescription || !editingMeal) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const updatedMeal = { ...editingMeal, name: mealName, description: mealDescription, receitas: selectedReceitas };

    const updatedMeals = {
      ...meals,
      [selectedDate]: meals[selectedDate].map((meal) =>
        meal.id === editingMeal.id ? updatedMeal : meal
      ),
    };

    setMeals(updatedMeals);
    updateMealInFirestore(updatedMeal);
    setModalVisible(false);
    setMealName('');
    setMealDescription('');
    setEditingMeal(null);
    setSelectedReceitas([]);
  };

  const deleteMeal = (mealId: string) => {
    Alert.alert(
      'Confirmar Deleção',
      'Você tem certeza que deseja deletar esta refeição?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          onPress: async () => {
            const updatedMeals = {
              ...meals,
              [selectedDate]: meals[selectedDate].filter((meal) => meal.id !== mealId),
            };

            setMeals(updatedMeals);
            await deleteMealFromFirestore(mealId);
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const viewMeal = (meal: Meal) => {
    console.log(`Visualizando refeição: ${meal.name}`);
    console.log(`Receitas: ${JSON.stringify(meal.receitas)}`);
    setViewingMeal(meal);
    setViewModalVisible(true);
  };

  const getIngredientsList = (receitas: Receita[]): string[] => {
    const ingredientsSet = new Set<string>();
    receitas.forEach(receita => {
      if (Array.isArray(receita.ingredientes)) {
        console.log(`Processando ingredientes da receita: ${receita.titulo}`);
        receita.ingredientes.forEach(ingrediente => {
          console.log(`Adicionando ingrediente: ${ingrediente.name}`);
          ingredientsSet.add(ingrediente.name);
        });
      }
    });
    return Array.from(ingredientsSet);
  };
  
  const renderMeal = ({ item }: { item: Meal }) => (
    <TouchableOpacity onPress={() => viewMeal(item)}>
      <View style={styles.mealContainer}>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealDescription}>{item.description}</Text>
        <View style={styles.mealActions}>
          <TouchableOpacity onPress={() => editMeal(item)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteMeal(item.id)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPickerItems = (items: Receita[]) => (
    <ScrollView style={styles.pickerContainer}>
      {items.map((item) => (
        <TouchableOpacity key={item.id} onPress={() => {
          setSelectedReceitas(prev => {
            if (prev.find(receita => receita.id === item.id)) {
              return prev.filter(receita => receita.id !== item.id);
            } else {
              return [...prev, item];
            }
          });
          setSelectedPicker(null);
        }}>
          <Text style={styles.pickerItem}>{item.titulo}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const markedDates = Object.keys(meals).reduce((acc, date) => {
    acc[date] = { marked: true, dotColor: 'red' };
    return acc;
  }, {} as { [key: string]: MarkedDate });

  if (selectedDate) {
    markedDates[selectedDate] = { selected: true, marked: true, selectedColor: 'blue', dotColor: 'red' };
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Calendar
          onDayPress={(day: DateObject) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
        />
        {selectedDate && (
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>{editingMeal ? 'Atualizar Refeição' : 'Adicionar Refeição'}</Text>
          </TouchableOpacity>
        )}
        <FlatList
          data={meals[selectedDate] || []}
          keyExtractor={(item: { id: any; }) => item.id}
          renderItem={renderMeal}
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
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                  <Text style={styles.modalTitle}>{editingMeal ? 'Editar Refeição' : 'Adicionar Refeição'}</Text>
                  <Text style={styles.label}>Nome da Refeição</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome da Refeição"
                    value={mealName}
                    onChangeText={setMealName}
                  />
                  <Text style={styles.label}>Descrição da Refeição</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descrição da Refeição"
                    value={mealDescription}
                    onChangeText={setMealDescription}
                    multiline={true}
                    numberOfLines={4}
                  />
                  <TouchableOpacity style={styles.modalButton} onPress={() => setSelectedPicker('receitas')}>
                    <Text style={styles.modalButtonText}>Selecionar Receitas</Text>
                  </TouchableOpacity>
                  {selectedReceitas.length > 0 && (
                    <View style={styles.selectedReceitasContainer}>
                      <Text style={styles.selectedReceitasTitle}>Receitas Selecionadas:</Text>
                      {selectedReceitas.map(receita => (
                        <Text key={receita.id} style={styles.selectedReceitaText}>{receita.titulo}</Text>
                      ))}
                    </View>
                  )}
                  {selectedPicker === 'receitas' && renderPickerItems(receitas)}
                  <TouchableOpacity style={styles.modalButton} onPress={editingMeal ? updateMeal : addMeal}>
                    <Text style={styles.modalButtonText}>{editingMeal ? 'Atualizar' : 'Salvar'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={viewModalVisible}
          onRequestClose={() => setViewModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {viewingMeal && (
                  <>
                    <Text style={styles.modalTitle}>Visualizar Refeição</Text>
                    <Text style={styles.label}>Nome da Refeição</Text>
                    <Text style={styles.viewText}>{viewingMeal.name}</Text>
                    <Text style={styles.label}>Descrição da Refeição</Text>
                    <Text style={styles.viewText}>{viewingMeal.description}</Text>
                    <Text style={styles.label}>Receitas</Text>
                    {viewingMeal.receitas && viewingMeal.receitas.map(receita => (
                      <Text key={receita.id} style={styles.viewText}>{receita.titulo}</Text>
                    ))}
                    <Text style={styles.label}>Ingredientes</Text>
                    {viewingMeal.receitas && getIngredientsList(viewingMeal.receitas).map((ingrediente, index) => (
                      <Text key={index} style={styles.viewText}>{ingrediente}</Text>
                    ))}
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setViewModalVisible(false)}>
                      <Text style={styles.modalButtonText}>Fechar</Text>
                    </TouchableOpacity>
                  </>
                )}
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
  addButton: {
    backgroundColor: '#FC7493',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealDescription: {
    fontSize: 14,
    color: '#A1A1A1',
  },
  mealActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
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
  scrollViewContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  input: {
    width: '100%',
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
    width: '100%',
    height: 80,
    textAlignVertical: 'top',
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
  cancelButton: {
    backgroundColor: '#A1A1A1',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    maxHeight: 200,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  pickerItem: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedReceitasContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    width: '100%',
  },
  selectedReceitasTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedReceitaText: {
    fontSize: 14,
    color: '#A1A1A1',
  },
  viewText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10
  },
});

export default PlannerRefeicao;