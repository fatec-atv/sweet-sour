import React from 'react';
import { NativeRouter, Route, Routes } from 'react-router-native';
import CadastroReceita from '../pages/cadastroReceita/cadastroReceita';
import Home from '../pages/home/home';
import ListagemReceita from '../pages/listagemReceita/ListagemReceita';
import CadastroUsuario from '../pages/cadastroUsuario/cadastroUsuario';
import Login from '../pages/login/login';
import MeuPerfil from '../pages/meuPerfil/meuPerfil';
import MinhasReceitas from '../pages/minhasReceitas/minhasReceitas';
import PlannerRefeicao from '../pages/plannerRefeicao/plannerRefeicao';
import Despensa from '../pages/despensa/despensa';


const AppRoutes: React.FC = () => {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/cadastro-receita" element={<CadastroReceita />} />
        <Route path="/listagem-receita" element={<ListagemReceita />} />
        <Route path="/" element={<Login />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/meu-perfil" element={<MeuPerfil />} />
        <Route path="/minhas-receitas" element={<MinhasReceitas />} />
        <Route path="/planner-refeicao" element={<PlannerRefeicao />} />
        <Route path="/despensa" element={<Despensa />} />
      </Routes>
    </NativeRouter>
  );
};

export default AppRoutes;