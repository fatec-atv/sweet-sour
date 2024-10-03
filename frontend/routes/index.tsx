import React from 'react';
import { NativeRouter, Route, Routes } from 'react-router-native';
import CadastroReceita from '../pages/cadastroReceita/CadastroReceita';
import Home from '../pages/home/Home';
import ListagemReceita from '../pages/listagemReceita/ListagemReceita';
import CadastroUsuario from '../pages/cadastroUsuario/cadastroUsuario';
import Login from '../pages/login/login';

const AppRoutes: React.FC = () => {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/cadastro-receita" element={<CadastroReceita />} />
        <Route path="/listagem-receita" element={<ListagemReceita />} />
        <Route path="/" element={<Home />} />
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </NativeRouter>
  );
};

export default AppRoutes;