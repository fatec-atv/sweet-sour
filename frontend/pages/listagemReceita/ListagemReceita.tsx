import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import ReceitaItem from './ReceitaItem';
import { db } from '../../config';
import { CheckBox } from 'react-native-elements';

interface Ingrediente {
  id: string;
  name: string;
}

interface Receita {
  id: string;
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

const restricoesOpcoes = ['Sem Glúten', 'Sem Lactose', 'Vegetariano', 'Vegano'];
const categoriasOpcoes = ['Entrada', 'Prato Principal', 'Sobremesa'];
const dificuldadesOpcoes = ['Fácil', 'Médio', 'Difícil'];

const ListagemReceitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string[]>([]);
  const [dificuldadeFiltro, setDificuldadeFiltro] = useState<string[]>([]);
  const [restricoesFiltro, setRestricoesFiltro] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
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

        // Aplicar filtros
        const receitasFiltradas = listaReceitas.filter(receita => {
          return (
            (categoriaFiltro.length === 0 || categoriaFiltro.includes(receita.categoria)) &&
            (dificuldadeFiltro.length === 0 || dificuldadeFiltro.includes(receita.dificuldade)) &&
            (restricoesFiltro.length === 0 || restricoesFiltro.every(restricao => receita.restricoesAlimentares.includes(restricao)))
          );
        });

        setReceitas(receitasFiltradas);
      } catch (error) {
        console.error('Erro ao buscar receitas:', error);
        Alert.alert('Erro', 'Não foi possível buscar as receitas.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceitas();
  }, [categoriaFiltro, dificuldadeFiltro, restricoesFiltro]);

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'categoria') {
      setCategoriaFiltro(prevState =>
        prevState.includes(value)
          ? prevState.filter(item => item !== value)
          : [...prevState, value]
      );
    } else if (filter === 'dificuldade') {
      setDificuldadeFiltro(prevState =>
        prevState.includes(value)
          ? prevState.filter(item => item !== value)
          : [...prevState, value]
      );
    } else if (filter === 'restricoesAlimentares') {
      setRestricoesFiltro(prevState =>
        prevState.includes(value)
          ? prevState.filter(item => item !== value)
          : [...prevState, value]
      );
    }
  };

  const renderItem = ({ item }: { item: Receita }) => (
    <ReceitaItem item={item} onPress={() => navigation.navigate('VisualizacaoReceita', { id: item.id })} />
  );

  const openModal = (filter: string) => {
    setSelectedFilter(filter);
    setModalVisible(true);
  };

  const renderFilterOptions = (options: string[], filter: string) => (
    <View style={styles.checkboxContainer}>
      {options.map((option) => (
        <CheckBox
          key={option}
          title={option}
          checked={
            filter === 'categoria'
              ? categoriaFiltro.includes(option)
              : filter === 'dificuldade'
              ? dificuldadeFiltro.includes(option)
              : restricoesFiltro.includes(option)
          }
          onPress={() => handleFilterChange(filter, option)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por:</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => openModal('categoria')}>
          <Text style={styles.filterButtonText}>Categoria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => openModal('dificuldade')}>
          <Text style={styles.filterButtonText}>Dificuldade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => openModal('restricoesAlimentares')}>
          <Text style={styles.filterButtonText}>Restrições Alimentares</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={receitas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione uma opção</Text>
            {selectedFilter === 'categoria' && renderFilterOptions(categoriasOpcoes, 'categoria')}
            {selectedFilter === 'dificuldade' && renderFilterOptions(dificuldadesOpcoes, 'dificuldade')}
            {selectedFilter === 'restricoesAlimentares' && renderFilterOptions(restricoesOpcoes, 'restricoesAlimentares')}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#FC7493',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginBottom: 16,
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
  listContent: {
    paddingBottom: 16,
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

export default ListagemReceitas;