import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config'; // Certifique-se de que db é o Firestore configurado

// Importa o arquivo JSON com os ingredientes e categorias da pasta assets/data
import ingredientesData from '../../assets/data/ingredientes.json';

const ShoppingListPage = () => {
  const [loading, setLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState([]);

  // Função para buscar refeições da semana e extrair ingredientes
  const fetchShoppingList = async () => {
    try {
      console.log('Fetching meals...');
      const currentDate = new Date();
      
      // Calculando início e fim da semana no formato 'YYYY-MM-DD'
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const startOfWeekString = startOfWeek.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const endOfWeekString = endOfWeek.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
      console.log('Start of week:', startOfWeekString);
      console.log('End of week:', endOfWeekString);
  
      // Query para buscar refeições da semana usando strings de data
      const mealsQuery = query(
        collection(db, 'meals'),
        where('date', '>=', startOfWeekString),
        where('date', '<=', endOfWeekString)
      );
  
      const querySnapshot = await getDocs(mealsQuery);
  
      console.log('Documents found:', querySnapshot.size);
  
      const ingredientsSet = new Set();
  
      querySnapshot.forEach(doc => {
        console.log('Meal:', doc.data());
        const receitas = doc.data().receitas || [];
        receitas.forEach(receita => {
          const ingredientes = receita.ingredientes || [];
          ingredientes.forEach(ingrediente => {
            if (ingrediente.name) {
              ingredientsSet.add(ingrediente.name);
            }
          });
        });
      });

      // Agora, vamos categorizar os ingredientes usando o JSON importado
      const categorizedIngredients = {};

      ingredientsSet.forEach(ingrediente => {
        // Encontrar a categoria do ingrediente no JSON importado
        const ingredient = ingredientesData.find(ing => ing.nome === ingrediente);
        if (ingredient) {
          const categoria = ingredient.categoria_nome;
          if (!categorizedIngredients[categoria]) {
            categorizedIngredients[categoria] = [];
          }
          categorizedIngredients[categoria].push(ingrediente);
        }
      });

      // Convertendo o objeto de categorias para um array de categorias
      const categorizedArray = Object.keys(categorizedIngredients).map(categoria => ({
        categoria,
        items: categorizedIngredients[categoria]
      }));

      setShoppingList(categorizedArray);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar lista de compras:', error);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Para indicar que está carregando
        await fetchShoppingList();
      } catch (error) {
        console.error('Error fetching shopping list:', error);
      } finally {
        setLoading(false); // Indica que o carregamento foi concluído
      }
    };
  
    fetchData();
  }, []);
  

  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.categoria}</Text>
      <FlatList
        data={item.items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.itemText}>{item}</Text>}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Carregando lista de compras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Compras</Text>
      {shoppingList.length > 0 ? (
        <FlatList
          data={shoppingList}
          keyExtractor={(item) => item.categoria}
          renderItem={renderCategory}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhum item encontrado.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 18,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
});

export default ShoppingListPage;
