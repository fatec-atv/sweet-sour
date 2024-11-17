import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
  categoria: string;
  imagem: string | null;
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
          querySnapshot.forEach((docSnapshot) => {
            const receitaData = docSnapshot.data() as Omit<Receita, 'id'>;
            listaReceitas.push({
              id: docSnapshot.id,
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

  const editarReceita = (id: string) => {
    navigation.navigate('EditarReceita', { id });
  };

  const deletarReceita = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'receitas', id));
      setReceitas(receitas.filter(receita => receita.id !== id));
      Alert.alert('Sucesso', 'Receita deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      Alert.alert('Erro', 'Não foi possível deletar a receita. Tente novamente.');
    }
  };

  const confirmarDelecaoReceita = (id: string) => {
    Alert.alert(
      'Confirmar Deleção',
      'Você tem certeza que deseja deletar esta receita?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          onPress: () => deletarReceita(id),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Receita }) => (
    <View style={styles.receitaCard}>
      <ReceitaItem
        item={item}
        onPress={() => navigation.navigate('VisualizacaoReceita', { id: item.id })} // Navega para a visualização
      />
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => editarReceita(item.id)}>
          <Icon name="edit" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmarDelecaoReceita(item.id)}>
          <Icon name="delete" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
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
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});

export default MinhasReceitas;