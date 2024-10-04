import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/FontAwesome';
import SweetSour from '../../assets/images/sweet_sour.png';
import Logo from '../../assets/images/logo.png';

const { width } = Dimensions.get('window');

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
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
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ListagemReceitas')}>
              <Icon name="list" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Listagem Receitas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Login')}>
              <Icon name="sign-in" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MeuPerfil')}>
              <Icon name="user" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Meu Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MinhasReceitas')}>
              <Icon name="book" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Minhas Receitas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Logout')}>
              <Icon name="sign-out" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.image} />
      </View>
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
    alignItems: 'center',
    marginBottom: 550, // Puxa o logo mais para cima
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  imageText: {
    height: 40,
    marginBottom: 10,
    marginLeft: 30, // Move a imagem mais para a esquerda
  },
});

export default Home;