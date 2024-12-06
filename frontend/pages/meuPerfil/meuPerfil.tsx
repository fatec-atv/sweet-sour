import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

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
  const [docId, setDocId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [restricoesOpcoes, setRestricoesOpcoes] = useState<string[]>(['Intolerância à Glúten', 'Intolerância à Lactose', 'Vegetarianismo', 'Veganismo']);
  const [restricaoSelecionada, setRestricaoSelecionada] = useState<string>('');
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('uid');
        if (!storedUserId) {
          console.log('UID do usuário não encontrado no AsyncStorage.');
          Alert.alert('Erro', 'UID do usuário não encontrado.');
          return;
        }

        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('uid', '==', storedUserId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            setUsuario(doc.data() as Usuario);
            setDocId(doc.id);
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

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    if (!docId || !usuario) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      return;
    }

    try {
      await updateDoc(doc(db, 'usuarios', docId), { ...usuario });

      Alert.alert('Sucesso', 'Alterações salvas com sucesso.');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Usuario, value: string) => {
    setUsuario((prevState) => (prevState ? { ...prevState, [field]: value } : null));
  };

  const toggleRestricao = (restricao: string) => {
    setRestricoes(prevState =>
      prevState.includes(restricao)
        ? prevState.filter(item => item !== restricao)
        : [...prevState, restricao]
    );
  };

  const handleDelete = async () => {
    try {
      if (!docId) {
        Alert.alert('Erro', 'ID do documento não encontrado.');
        return;
      }

      await deleteDoc(doc(db, 'usuarios', docId));
      await AsyncStorage.removeItem('uid');

      Alert.alert('Sucesso', 'Perfil excluído com sucesso.');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // Substitua 'Login' pelo nome da sua tela de login
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      Alert.alert('Erro', 'Não foi possível excluir o perfil.');
    } finally {
      setModalVisible(false);
    }
  };

  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

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
        <TextInput
          style={styles.input}
          value={usuario.nome}
          editable={isEditing}
          onChangeText={(value) => handleInputChange('nome', value)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={usuario.email}
          editable={false}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Telefone:</Text>
        <TextInput
          style={styles.input}
          value={usuario.telefone}
          editable={isEditing}
          onChangeText={(value) => handleInputChange('telefone', value)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>CPF:</Text>
        <TextInput
          style={styles.input}
          value={usuario.cpf}
          editable={isEditing}
          onChangeText={(value) => handleInputChange('cpf', value)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Senha:</Text>
        <TextInput
          style={styles.input}
          value="••••••••"
          secureTextEntry={true}
          editable={false}
        />
      </View>


      {isEditing ? (
        // Modo de edição
        <View style={styles.field}>
          <Text style={styles.label}>Restrições Alimentares:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue=""
              onValueChange={itemValue => toggleRestricao(itemValue)}
              style={styles.picker}
            >
              {restricoesOpcoes.map((opcao, index) => (
                <Picker.Item key={index} label={opcao} value={opcao} />
              ))}
            </Picker>
          </View>

          <View style={styles.selectedItemsContainer}>
            {restricoes.map((restricao, index) => (
              <View key={index} style={styles.selectedItemContainer}>
                <Text style={styles.selectedItem}>{restricao}</Text>
                <TouchableOpacity onPress={() => toggleRestricao(restricao)}>
                  <Text style={styles.removeItem}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : (
        
        <View style={styles.field}>
          <Text style={styles.label}>Restrições Alimentares:</Text>
          <View style={styles.selectedItemsContainer}>
            {restricoes.length > 0 ? (
              restricoes.map((restricao, index) => (
                <Text key={index} style={styles.restricao}>
                  - {restricao}
                </Text>
              ))
            ) : (
              <Text style={styles.selectedItem}>Nenhuma restrição selecionada.</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.buttonsContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.buttonEdit} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonDelete} onPress={handleCancelEdit}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.buttonEdit} onPress={handleEdit}>
              <Text style={styles.buttonText}>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonDelete} onPress={handleOpenModal}>
              <Text style={styles.buttonText}>Excluir Perfil</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalMessage}>Tem certeza de que deseja excluir seu perfil?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={handleCloseModal}>
                <Text style={styles.modalButtonText}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleDelete}>
                <Text style={styles.modalButtonText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: '100%', 
    paddingHorizontal: '10%',
  },
  buttonEdit: {
    width: '40%',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDelete: {
    width: '40%',
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 10,
    marginRight: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    marginLeft: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  restricao: {
    marginRight: 10,
    marginLeft: 5,
    fontWeight: 'bold',
  }
});

export default MeuPerfil;