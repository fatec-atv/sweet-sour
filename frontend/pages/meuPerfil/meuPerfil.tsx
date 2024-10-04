import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config'; // Certifique-se de importar corretamente
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para pegar o UID armazenado

interface Usuario {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
  restricoesAlimentares: string[];
}

const MeuPerfil: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Recuperar o UID do AsyncStorage
        const storedUserId = await AsyncStorage.getItem('uid');
        if (!storedUserId) {
          console.log('UID do usuário não encontrado no AsyncStorage.');
          Alert.alert('Erro', 'UID do usuário não encontrado.');
          return;
        }

        console.log('UID do usuário recuperado:', storedUserId);

        // Query para encontrar o documento do usuário onde o campo `uid` corresponde
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('uid', '==', storedUserId));
        const querySnapshot = await getDocs(q);

        // Verificando se algum documento foi encontrado
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            console.log('Usuário encontrado:', doc.data());
            setUsuario(doc.data() as Usuario);
          });
        } else {
          console.log('Nenhum usuário encontrado com o UID:', storedUserId);
          Alert.alert('Erro', 'Nenhum usuário encontrado com o UID.');
          setUsuario(null);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        Alert.alert('Erro', 'Não foi possível buscar os detalhes do perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text>Usuário não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nome:</Text>
        <TextInput style={styles.input} value={usuario.nome} editable={false} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email:</Text>
        <TextInput style={styles.input} value={usuario.email} editable={false} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Telefone:</Text>
        <TextInput style={styles.input} value={usuario.telefone} editable={false} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>CPF:</Text>
        <TextInput style={styles.input} value={usuario.cpf} editable={false} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Senha:</Text>
        <TextInput
          style={styles.input}
          value="••••••••" // Exibir bolinhas no lugar da senha
          secureTextEntry={true}
          editable={false}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Restrições Alimentares:</Text>
        {usuario.restricoesAlimentares && usuario.restricoesAlimentares.length > 0 ? (
          usuario.restricoesAlimentares.map((restricao, index) => (
            <Text key={index} style={styles.restricao}>
              - {restricao}
            </Text>
          ))
        ) : (
          <Text>Nenhuma restrição alimentar cadastrada</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#C5C5C5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  restricao: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
});

export default MeuPerfil;
