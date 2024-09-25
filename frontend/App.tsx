import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './pages/home/home';
import CadastroReceita from './pages/cadastroReceita/cadastroReceita';

export type RootStackParamList = {
  Home: undefined;
  CadastroReceita: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="CadastroReceita" component={CadastroReceita} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;