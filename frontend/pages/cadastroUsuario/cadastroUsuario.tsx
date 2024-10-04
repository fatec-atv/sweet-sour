import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { authFirebase, db } from '../../config';
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
        // Obtendo o usuário autenticado
        const user = authFirebase.currentUser;
        if (!user) {
          console.log('Nenhum usuário autenticado.');
          Alert.alert('Erro', 'Nenhum usuário autenticado.');
          return;
        }

        console.log('UID do usuário autenticado:', user.uid);

        // Query para encontrar o documento do usuário onde o campo `uid` corresponde
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        // Verificando se algum documento foi encontrado
        if (!querySnapshot.empty) {
          // Iterando sobre os resultados (mesmo que só tenha um)
          querySnapshot.forEach((doc) => {
            console.log('Usuário encontrado:', doc.data());
            setUsuario(doc.data() as Usuario);
          });
        } else {
          console.log('Nenhum usuário encontrado com o UID:', user.uid);
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
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginTop: 5,
  },
  restricao: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
});

export default MeuPerfil;
