import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../App'; // Verifique o caminho correto do arquivo RootStackParamList
import { db } from '../../config';
import ReceitaItem from '../listagemReceita/ReceitaItem';

interface Receita {
  id: string;
  titulo: string;
  descricao: string;
  uid: string;
}

const MinhasReceitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchMinhasReceitas = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('uid');
        if (!storedUserId) {
          console.log('UID do usuário não encontrado no AsyncStorage.');
          Alert.alert('Erro', 'UID do usuário não encontrado.');
          return;
        }

        const receitasRef = collection(db, 'receitas');
        const q = query(receitasRef, where('uid', '==', storedUserId));
        const querySnapshot = await getDocs(q);

        const listaReceitas: Receita[] = [];
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const receitaData = doc.data() as Receita;
            listaReceitas.push({
              id: doc.id,
              ...receitaData,
            });
          });
          setReceitas(listaReceitas);
        } else {
          console.log('Nenhuma receita encontrada para este usuário.');
        }
      } catch (error) {
        console.error('Erro ao buscar receitas do usuário:', error);
        Alert.alert('Erro', 'Não foi possível buscar suas receitas.');
      } finally {
        setLoading(false);
      }
    };

    fetchMinhasReceitas();
  }, []);

  const renderItem = ({ item }: { item: Receita }) => (
    <ReceitaItem
      item={item}
      onPress={() => navigation.navigate('VisualizacaoReceita', { id: item.id })} // Navega para a visualização
    />
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Carregando suas receitas...</Text>
        </View>
      ) : receitas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text>Você ainda não cadastrou nenhuma receita.</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CadastroReceita')}>
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={receitas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CadastroReceita')}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  receitaCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receitaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#FC7493',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 5, 
  },
});

export default MinhasReceitas;
