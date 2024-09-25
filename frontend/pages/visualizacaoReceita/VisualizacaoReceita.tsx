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
  const { id } = route.params; 
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
        <Text style={styles.loadingText}>Carregando...</Text>
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
      <Text style={styles.title2}>Categoria:</Text>
      <Text style={styles.detail}>{receita.categoria}</Text>
      <Text style={styles.title2}>Descrição:</Text>
      <Text style={styles.detail}>{receita.descricao}</Text>
      <Text style={styles.title2}>Restrições Alimentares:</Text>
      {receita.restricoesAlimentares.map((restricao, index) => (
        <Text style={styles.lista} key={`${restricao}-${index}`}>{restricao}</Text>
      ))}
            <Text style={styles.title2}>Ingredientes:</Text>
      {receita.ingredientes.map((ingrediente) => (
        <Text style={styles.lista} key={ingrediente.id}>{ingrediente.name}</Text>
      ))}
      <Text style={styles.title2}>Tempo de Preparo:</Text>
      <Text style={styles.detail}>{receita.tempoPreparo}</Text>
      <Text style={styles.title2}>Número de Porções:</Text>
      <Text style={styles.detail}>{receita.porcoes}</Text>
      <Text style={styles.title2}>Dificuldade:</Text>
      <Text style={styles.detail}>{receita.dificuldade}</Text>
      <Text style={styles.title2}>Modo de Preparo:</Text>
      <Text style={styles.detail}>{receita.modoPreparo}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  title2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 12,
  },
  lista: {
    fontSize: 16,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default VisualizacaoReceita;
