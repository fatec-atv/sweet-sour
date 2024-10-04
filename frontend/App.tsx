import 'react-native-gesture-handler';
import React from 'react';
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
import Comentar from './pages/comentario/comentar';
import ComentariosReceita from './components/comentarios';
import TelaComentarios from './pages/comentario/comentarios';

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
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="CadastroReceita" component={CadastroReceita} />
        <Stack.Screen name="ListagemReceitas" component={ListagemReceitas} />
        <Stack.Screen name="VisualizacaoReceita" component={VisualizacaoReceita} /> 
        <Stack.Screen name="CadastroUsuario" component={CadastroUsuario} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MeuPerfil" component={MeuPerfil} />
        <Stack.Screen name="MinhasReceitas" component={MinhasReceitas} />
        <Stack.Screen name="Comentar" component={Comentar} />
        <Stack.Screen name="Comentarios" component={TelaComentarios} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;