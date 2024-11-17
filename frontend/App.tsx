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
import Comentar from './pages/comentario/comentar';
import ComentariosReceita from './components/comentarios';
import TelaComentarios from './pages/comentario/comentarios';
import AdicionarListas from './pages/listas/adicionarLista';
import Listas from './pages/listas/listas';
import ReceitasListas from './pages/listas/receitasListas';
import ReceitasFavoritas from './pages/listas/favoritos';
import EditarReceita from './pages/editarReceita/editarReceita';
import PlannerRefeicao from './pages/plannerRefeicao/plannerRefeicao';

export type RootStackParamList = {
  Home: undefined;
  CadastroReceita: undefined;
  ListagemReceitas: undefined;
  VisualizacaoReceita: { id: string };
  EditarReceita: { id: string };
  CadastroUsuario: undefined;
  Login: undefined;
  MeuPerfil: undefined;
  MinhasReceitas: undefined;
  Comentar: { idReceita: string };
  Comentarios: { idReceita: string };
  'Adicionar à Lista': { idReceita: string };
  Listas: undefined;
  'Receitas da lista': { idLista: string };
  'Receitas favoritas': undefined;
  PlannerRefeicao: undefined;
  Logout: undefined;
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
        <Stack.Screen name="Comentar" component={Comentar} />
        <Stack.Screen name="Comentarios" component={TelaComentarios} />
        <Stack.Screen name="Adicionar à Lista" component={AdicionarListas} />
        <Stack.Screen name="Listas" component={Listas} />
        <Stack.Screen name="Receitas da lista" component={ReceitasListas} />
        <Stack.Screen name="Receitas favoritas" component={ReceitasFavoritas} />
        <Stack.Screen name="EditarReceita" component={EditarReceita} />
        <Stack.Screen name="PlannerRefeicao" component={PlannerRefeicao} />
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