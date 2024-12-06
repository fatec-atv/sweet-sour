import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ModalReceita from '../../components/modal';

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
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [uidUsuario, setUidUsuario] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceita = async () => {
      try {
        const receitaRef = doc(db, 'receitas', id);
        const receitaSnap = await getDoc(receitaRef);

        if (receitaSnap.exists()) {
          const receitaData = receitaSnap.data() as Receita;
          setReceita(receitaData);
          setUidUsuario(receitaData.uid);

          const usuariosRef = collection(db, 'usuarios');
          const q = query(usuariosRef, where('uid', '==', receitaData.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              setUsuarioNome(doc.data().nome);
            });
          } else {
            setUsuarioNome(null);
          }
        } else {
          console.log("Receita não encontrada com o ID:", id);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar os detalhes da receita.');
      } finally {
        setLoading(false);
      }
    };
    fetchReceita();
  }, [id]);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const openImageModal = (image: string) => {
    setSelectedImage(image);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

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
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>{receita.titulo}</Text>
        {receita.imagem ? (
          <TouchableOpacity onPress={() => openImageModal(receita.imagem)}>
            <Image source={{ uri: receita.imagem }} style={styles.image} />
          </TouchableOpacity>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={toggleModal}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ModalReceita
        modalVisible={modalVisible}
        toggleModal={toggleModal}
        idReceita={id}
        uidUsuario={uidUsuario}
      />

      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeImageModal}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity style={styles.imageModalCloseButton} onPress={closeImageModal}>
            <Text style={styles.imageModalCloseText}>X</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.imageModal} />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAFB',
  },
  scroll: {
    padding: 16,
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: '#FC7493',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 30,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModal: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  imageModalCloseText: {
    color: 'white',
    fontSize: 30,
  },
});

export default VisualizacaoReceita;