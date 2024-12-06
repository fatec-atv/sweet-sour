import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, FlatList } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/FontAwesome';
import SweetSour from '../../assets/images/sweet_sour.png'; //não mexer para não quebrar o app
import Logo from '../../assets/images/logo.png'; //não mexer para não quebrar o app
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config';
import { Receita } from '../../interfaces/Receita';

const { width } = Dimensions.get('window');

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [ultimasReceitas, setUltimasReceitas] = useState<Receita[]>([]);

  useEffect(() => {
    const fetchUltimasReceitas = async () => {
      try {
        const receitasRef = collection(db, 'receitas');
        const querySnapshot = await getDocs(receitasRef);
        const receitas: Receita[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const [day, month, year] = data.created_at.split('/');
          const isoDate = new Date(`${year}-${month}-${day}`).toISOString();
          receitas.push({ id: doc.id, ...data, created_at: isoDate } as unknown as Receita);
        });
        receitas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setUltimasReceitas(receitas.slice(0, 5));
      } catch (error) {
        console.error('Erro ao buscar as últimas receitas:', error);
      }
    };

    fetchUltimasReceitas();
  }, []);

  const renderReceitaItem = ({ item }: { item: Receita }) => (
    <TouchableOpacity style={styles.receitaItem} onPress={() => navigation.navigate('VisualizacaoReceita', { id: item.id })}>
      <Image source={item.imagem ? { uri: item.imagem } : require('../../assets/images/default_image.png')} style={styles.receitaImage} />
      <View style={styles.receitaTextContainer}>
        <Text style={styles.receitaTitle}>{item.titulo}</Text>
        <Text style={styles.receitaCategoria}>{item.categoria}</Text>
      </View>
    </TouchableOpacity>
  );

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('uid');
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Icon name="bars" size={30} color="black" />
        </TouchableOpacity>
        <Image source={SweetSour} style={styles.imageText} />
      </View>
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.menuItemsContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
              <Icon name="home" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MeuPerfil')}>
              <Icon name="user" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Meu Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ListagemReceitas')}>
              <Icon name="list" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Listagem Receitas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MinhasReceitas')}>
              <Icon name="book" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Minhas Receitas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Listas')}>
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Listas e Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PlannerRefeicao')}>
              <Icon name="calendar" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Planner de Refeição</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Despensa')}>
              <Icon name="shopping-basket" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Despensa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Lista de Compras')}>
              <Icon name="shopping-basket" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Compras</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Icon name="sign-out" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.image} />
      </View>
      <FlatList
        data={ultimasReceitas}
        renderItem={renderReceitaItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.sectionTitle}>Últimas Receitas</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.verMaisButton} onPress={() => navigation.navigate('ListagemReceitas')}>
            <Text style={styles.verMaisText}>Ver mais</Text>
            <Icon name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza os itens horizontalmente
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  menuButton: {
    position: 'absolute',
    left: 20,
    zIndex: 2, // Garante que o botão de menu esteja acima da imagem
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fc7493',
    padding: 20,
    zIndex: 1,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
  },
  menuItemsContainer: {
    marginTop: 80, // Adiciona margem superior ao container dos itens do menu
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 18,
    color: '#fff',
  },
  logoContainer: {
    justifyContent: 'center',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 550, // Puxa o logo mais para cima
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    marginTop: 100, 
  },
  imageText: {
    height: 40,
    marginBottom:10,
    marginLeft: 30, // Move a imagem mais para a esquerda
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  verMaisButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FC7493',
    borderRadius: 25,
    marginTop: 20,
    marginBottom: 60,
    marginHorizontal: 20,
  },
  verMaisText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  receitaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    padding: 15,
    marginHorizontal: width * 0.05,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  receitaImage: {
    width: 135, 
    height: 90, 
    marginRight: 10,
    borderRadius: 5, 
  },
  receitaTitle: {
    fontSize: 18,
    flexShrink: 1,
    fontWeight: 'bold', 
  },
  receitaCategoria: {
    fontSize: 14,
    color: '#888', 
  },
  receitaTextContainer: {
    justifyContent: 'flex-start', 
  },
});

export default Home;