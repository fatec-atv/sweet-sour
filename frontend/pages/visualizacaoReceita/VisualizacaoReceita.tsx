import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config';

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
  imagem: string | null;
  uid: string;
}

const VisualizacaoReceita: React.FC = ({ route }: any) => {
  const { id } = route.params;
  const [receita, setReceita] = useState<Receita | null>(null);
  const [usuarioNome, setUsuarioNome] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReceita = async () => {
      try {
        const receitaRef = doc(db, 'receitas', id);
        const receitaSnap = await getDoc(receitaRef);

        if (receitaSnap.exists()) {
          const receitaData = receitaSnap.data() as Receita;
          setReceita(receitaData);

          console.log('UID do usuário:', receitaData.uid);

          if (!receitaData.uid) {
            console.log('UID do usuário não encontrado na receita.');
            setUsuarioNome(null);
            return;
          }

          const usuarioRef = doc(db, 'usuarios', receitaData.uid);
          console.log('Buscando usuário com UID:', receitaData.uid);

          const usuarioSnap = await getDoc(usuarioRef);

          if (usuarioSnap.exists()) {
            console.log("Usuário encontrado:", usuarioSnap.data());
            setUsuarioNome(usuarioSnap.data().nome);
          } else {
            console.log("Usuário não encontrado");
            setUsuarioNome(null);
          }

        } else {
          console.log("Receita não encontrada");
        }
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{receita.titulo}</Text>
      {receita.imagem ? (
        <Image source={{ uri: receita.imagem }} style={styles.image} />
      ) : (
        <Text style={styles.detail}>Imagem não disponível</Text>
      )}
      <Text style={styles.title2}>Autor:</Text>
      <Text style={styles.detail}>{usuarioNome || 'Nome não disponível'}</Text>
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
      <View style={styles.footerSpacing} />
    </ScrollView>
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
  image: {
    width: '100%',
    height: 200,
    marginBottom: 12,
  },
  footerSpacing: {
    paddingBottom: 20,
  },
});

export default VisualizacaoReceita;