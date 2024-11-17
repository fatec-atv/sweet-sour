import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import ReceitaItem from './ReceitaItem';
import { db } from '../../config';

interface Receita {
  id: string;
  titulo: string;
  categoria: string;
  imagem: string | null;
}

const ListagemReceitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchReceitas = async () => {
      try {
        const receitasRef = collection(db, 'receitas');
        const snapshot = await getDocs(receitasRef);
        const listaReceitas: Receita[] = [];
        
        snapshot.forEach((doc) => {
          listaReceitas.push({
            id: doc.id,
            ...doc.data(),
          } as Receita);
        });

        setReceitas(listaReceitas);
      } catch (error) {
        console.error('Erro ao buscar receitas:', error);
        Alert.alert('Erro', 'Não foi possível buscar as receitas.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceitas();
  }, []);

  const renderItem = ({ item }: { item: Receita }) => (
    <ReceitaItem item={item} onPress={() => navigation.navigate('VisualizacaoReceita', { id: item.id })} />
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
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
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAFB',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ListagemReceitas;
