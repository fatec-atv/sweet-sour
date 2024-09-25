import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

interface Receita {
  id: string;
  titulo: string;
  categoria: string;
}

const ListagemReceitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchReceitas = async () => {
      try {
        const response = await axios.get(`${API_URL}/listar/receitas`);
        setReceitas(response.data);
      } catch (error) {
        console.error('Erro ao buscar receitas:', error);
        Alert.alert('Erro', 'Não foi possível buscar as receitas.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceitas();
  }, []);

  const renderItem = ({ item }: { item: Receita }) => {
    const [isHovered, setIsHovered] = useState(false); // Estado para controlar o hover

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.cardContainer, isHovered && styles.cardHovered]} // Adiciona a classe de hover
        onPress={() => navigation.navigate('VisualizacaoReceita', { id: item.id })}
        onPressIn={() => setIsHovered(true)} // Ativa o hover quando pressionado
        onPressOut={() => setIsHovered(false)} // Desativa o hover quando não pressionado
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <Text style={styles.cardCategory}>{item.categoria}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={receitas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFAFB',
  },
  cardContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#FFBECD',
    shadowOpacity: 0.2, // Mudado para um valor mais realista
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5, // Mudado para um valor mais realista
    elevation: 5,
  },
  cardHovered: {
    backgroundColor: '#FFDFDF', // Cor do fundo quando o card é "hovered"
    shadowOpacity: 0.4, // Aumenta a opacidade da sombra ao ser "hovered"
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: '#888',
  },
});

export default ListagemReceitas;
