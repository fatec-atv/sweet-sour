import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './pages/home/Home';
import CadastroReceita from './pages/cadastroReceita/CadastroReceita';
import ListagemReceitas from './pages/listagemReceita/ListagemReceita';
import VisualizacaoReceita from './pages/visualizacaoReceita/VisualizacaoReceita';

export type RootStackParamList = {
  Home: undefined;
  CadastroReceita: undefined;
  ListagemReceitas: undefined;
  VisualizacaoReceita: { id: string }; // Adicione esta linha
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;