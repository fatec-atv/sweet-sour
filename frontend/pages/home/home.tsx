import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Função de logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('uid'); // Remove o userId do AsyncStorage
      const userId = await AsyncStorage.getItem('uid'); // Verifica se foi removido
      if (!userId) {
        Alert.alert('Logout', 'Você foi desconectado com sucesso!');
        navigation.navigate('Login'); // Redireciona para a tela de login
      } else {
        Alert.alert('Erro', 'Erro ao desconectar. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao fazer logout.');
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CadastroReceita')}
      >
        <Text style={styles.buttonText}>Cadastrar receitas</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ListagemReceitas')}
      >
        <Text style={styles.buttonText}>Listar receitas</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CadastroUsuario')}
      >
        <Text style={styles.buttonText}>Cadastrar usuário</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MeuPerfil')}
      >
        <Text style={styles.buttonText}>Meu perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MinhasReceitas')}
      >
        <Text style={styles.buttonText}>Minhas receitas</Text>
      </TouchableOpacity>
      {/* Botão de Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout} // Chama a função de logout
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
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
  button: {
    marginTop: 20,
    backgroundColor: '#fc7493',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#555', // Cor diferente para o botão de logout
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: 300,
  },
});

export default Home;