import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Receita {
  id: string;
  titulo: string;
  descricao: string;
  tempoPreparo: string;
  porcoes: string;
  dificuldade: string;
  categoria: string;
  restricoesAlimentares: string[];
  ingredientes: { id: string; name: string }[];
  modoPreparo: string;
}

const VisualizacaoReceita: React.FC = ({ route }: any) => {
  const { id } = route.params; // Recebe o id da receita através da navegação
  const [receita, setReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReceita = async () => {
      try {
        const response = await axios.get(`${API_URL}/buscar/receitas/${id}`);
        setReceita(response.data);
      } catch (error) {
        console.error('Erro ao buscar receita:', error);
        Alert.alert('Erro', 'Não foi possível buscar os detalhes da receita.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceita();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!receita) {
    return (
      <View style={styles.errorContainer}>
        <Text>Receita não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{receita.titulo}</Text>
      <Text style={styles.detail}>Categoria: {receita.categoria}</Text>
      <Text style={styles.detail}>Tempo de Preparo: {receita.tempoPreparo}</Text>
      <Text style={styles.detail}>Porções: {receita.porcoes}</Text>
      <Text style={styles.detail}>Dificuldade: {receita.dificuldade}</Text>
      <Text style={styles.description}>{receita.descricao}</Text>
      <Text style={styles.detail}>Modo de Preparo:</Text>
      <Text>{receita.modoPreparo}</Text>
      <Text style={styles.detail}>Ingredientes:</Text>
      {receita.ingredientes.map((ingrediente) => (
        <Text key={ingrediente.id}>- {ingrediente.name}</Text>
      ))}
      <Text style={styles.detail}>Restrições Alimentares:</Text>
      {receita.restricoesAlimentares.map((restricao, index) => (
        <Text key={index}>- {restricao}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
});

export default VisualizacaoReceita;
