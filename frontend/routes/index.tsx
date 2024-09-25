import React from 'react';
import { NativeRouter, Route, Routes } from 'react-router-native';
import CadastroReceita from '../pages/cadastroReceita/cadastroReceita';

const AppRoutes: React.FC = () => {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/cadastro-receita" element={<CadastroReceita />} />
        <Route path="/" element={<CadastroReceita />} />
        {/* Outras rotas podem ser definidas aqui */}
      </Routes>
    </NativeRouter>
  );
};

export default AppRoutes;