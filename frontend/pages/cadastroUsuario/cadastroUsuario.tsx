import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
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

const restricoesOpcoes = ['Intolerância à Glúten', 'Intolerância à Lactose', 'Vegetarianismo', 'Veganismo'];

const CadastroUsuario: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario>({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    restricoesAlimentares: [],
  });

  const handleChange = (name: string, value: any) => {
    setUsuario({
      ...usuario,
      [name]: value,
    });
  };

  const validarCPF = (cpf: string) => {
    return /^[0-9]{11}$/.test(cpf);
  };
  
  const validarEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const toggleRestricao = (restricao: string) => {
    setUsuario((prevState) => {
      const restricoes = prevState.restricoesAlimentares.includes(restricao)
        ? prevState.restricoesAlimentares.filter((r) => r !== restricao)
        : [...prevState.restricoesAlimentares, restricao];

      return { ...prevState, restricoesAlimentares: restricoes };
    });
  };

  const handleSubmit = async () => {
    if (!usuario.nome || !usuario.email || !usuario.cpf || !usuario.telefone || !usuario.senha || !usuario.confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (usuario.senha !== usuario.confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (!validarCPF(usuario.cpf)) {
      Alert.alert('Erro', 'CPF inválido.');
      return;
    }
    
    if (!validarEmail(usuario.email)) {
      Alert.alert('Erro', 'E-mail inválido.');
      return;
    }    

    try {
      // 1. Registrar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(authFirebase, usuario.email, usuario.senha);
      const user = userCredential.user;

      // 2. Salvar dados adicionais no Firestore
      await addDoc(collection(db, 'usuarios'), {
        uid: user.uid,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
        restricoesAlimentares: usuario.restricoesAlimentares,
      });

      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o usuário.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Usuário</Text>
      <View style={styles.form}>
        {/* Campos de entrada */}
        <Text style={styles.label}>Nome:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={usuario.nome}
          onChangeText={(text) => handleChange('nome', text)}
        />
        <Text style={styles.label}>E-mail:</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={usuario.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
        />
        <Text style={styles.label}>CPF:</Text>
        <TextInput
          style={styles.input}
          placeholder="CPF"
          value={usuario.cpf}
          onChangeText={(text) => handleChange('cpf', text)}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Telefone:</Text>
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={usuario.telefone}
          onChangeText={(text) => handleChange('telefone', text)}
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Senha:</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={usuario.senha}
          onChangeText={(text) => handleChange('senha', text)}
          secureTextEntry={true}
        />
        <Text style={styles.label}>Confirmar Senha:</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          value={usuario.confirmarSenha}
          onChangeText={(text) => handleChange('confirmarSenha', text)}
          secureTextEntry={true}
        />

        <Text style={styles.label}>Restrições Alimentares:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue=""
            onValueChange={(value) => {
              if (value) toggleRestricao(value);
            }}
          >
            <Picker.Item label="Selecione uma restrição" value="" />
            {restricoesOpcoes.map((opcao) => (
              <Picker.Item key={opcao} label={opcao} value={opcao} />
            ))}
          </Picker>
        </View>

        <View style={styles.selectedItemsContainer}>
          {usuario.restricoesAlimentares.map((restricao, index) => (
            <View key={index} style={styles.selectedItemContainer}>
              <Text style={styles.selectedItem}>{restricao}</Text>
              <TouchableOpacity onPress={() => toggleRestricao(restricao)}>
                <Text style={styles.removeItem}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Cadastrar Usuário</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E282A',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    flexDirection: 'column',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#A1A1A1',
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
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDD2DD',
    borderRadius: 15,
    padding: 5,
    margin: 5,
    borderColor: '#FC7493',
    borderWidth: 1,
  },
  selectedItem: {
    marginRight: 10,
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#FC7493',
  },
  removeItem: {
    color: '#FC7493',
    fontWeight: 'bold',
    marginRight: 5,
  },
  button: {
    backgroundColor: '#FC7493',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CadastroUsuario;
