import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ListagemReceitas from './pages/listagemReceita/ListagemReceita';
import VisualizacaoReceita from './pages/visualizacaoReceita/VisualizacaoReceita';
import CadastroReceita from './pages/cadastroReceita/cadastroReceita';
import Home from './pages/home/home';
import CadastroUsuario from './pages/cadastroUsuario/cadastroUsuario';
import Login from './pages/login/login';
import MeuPerfil from './pages/meuPerfil/meuPerfil';
import MinhasReceitas from './pages/minhasReceitas/minhasReceitas';

export type RootStackParamList = {
  Home: undefined;
  CadastroReceita: undefined;
  ListagemReceitas: undefined;
  VisualizacaoReceita: { id: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="CadastroReceita" component={CadastroReceita} />
          <Stack.Screen name="ListagemReceitas" component={ListagemReceitas} />
          <Stack.Screen name="VisualizacaoReceita" component={VisualizacaoReceita} />
          <Stack.Screen name="CadastroUsuario" component={CadastroUsuario} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MeuPerfil" component={MeuPerfil} />
          <Stack.Screen name="MinhasReceitas" component={MinhasReceitas} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;