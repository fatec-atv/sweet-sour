import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config';
import { FontAwesome } from '@expo/vector-icons';

const Listas: React.FC = () => {
    const [listas, setListas] = useState<any[]>([]);
    const [favoritos, setFavoritos] = useState<any[]>([]);
    const [uidUsuario, setUidUsuario] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [nomeLista, setNomeLista] = useState('');
    const [editingListaId, setEditingListaId] = useState<string | null>(null);
    const [nomeListaEditando, setNomeListaEditando] = useState(''); // Estado separado para o nome sendo editado
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserIdAndListas = async () => {
            const storedUserId = await AsyncStorage.getItem('uid');
            if (storedUserId) {
                setUidUsuario(storedUserId);
                fetchListas(storedUserId);
                fetchFavoritos(storedUserId);
            }
        };
        fetchUserIdAndListas();
    }, []);

    const fetchListas = async (uid: string) => {
        const listasQuery = query(collection(db, 'listas'), where('usuarioId', '==', uid));
        const querySnapshot = await getDocs(listasQuery);
        const listasData = [];

        for (const doc of querySnapshot.docs) {
            const receitasQuery = query(collection(db, 'listas', doc.id, 'receitas'));
            const receitasSnapshot = await getDocs(receitasQuery);

            listasData.push({
                id: doc.id,
                ...doc.data(),
                totalReceitas: receitasSnapshot.size || 0,
            });
        }

        setListas(listasData);
    };

    const fetchFavoritos = async (uid: string) => {
        const favoritosQuery = query(collection(db, 'favoritos'), where('usuarioId', '==', uid));
        const querySnapshot = await getDocs(favoritosQuery);
        const favoritosData = [];
        const totalReceitas = querySnapshot.size;

        favoritosData.push({
            id: 'favoritos',
            nome: 'Favoritos',
            totalReceitas: totalReceitas,
        });

        setFavoritos(favoritosData);
    };

    const criarLista = async () => {
        if (!nomeLista) {
            Alert.alert('Erro', 'Por favor, insira um nome para a lista.');
            return;
        }
        try {
            const docRef = await addDoc(collection(db, 'listas'), {
                usuarioId: uidUsuario,
                nome: nomeLista,
            });
            setNomeLista('');
            setModalVisible(false);
            fetchListas(uidUsuario);
            Alert.alert('Sucesso', 'Lista criada com sucesso.');
        } catch (error) {
            console.error('Erro ao criar lista:', error);
            Alert.alert('Erro', 'Não foi possível criar a lista.');
        }
    };

    const excluirLista = async (listaId: string) => {
        try {
            await deleteDoc(doc(db, 'listas', listaId));
            setListas((prevListas) => prevListas.filter((lista) => lista.id !== listaId));
            Alert.alert('Sucesso', 'Lista excluída com sucesso.');
        } catch (error) {
            console.error('Erro ao excluir lista:', error);
            Alert.alert('Erro', 'Não foi possível excluir a lista.');
        }
    };

    const iniciarEdicao = (listaId: string, nome: string) => {
        setEditingListaId(listaId);
        setNomeListaEditando(nome);
    };

    const finalizarEdicao = async () => {
        if (!nomeListaEditando) {
            Alert.alert('Erro', 'Por favor, insira um nome válido para a lista.');
            return;
        }
        try {
            const listaRef = doc(db, 'listas', editingListaId!);
            await updateDoc(listaRef, { nome: nomeListaEditando });
            setListas((prevListas) =>
                prevListas.map((lista) =>
                    lista.id === editingListaId ? { ...lista, nome: nomeListaEditando } : lista
                )
            );
            setEditingListaId(null);
            setNomeListaEditando('');
            Alert.alert('Sucesso', 'Lista editada com sucesso.');
        } catch (error) {
            console.error('Erro ao editar lista:', error);
            Alert.alert('Erro', 'Não foi possível editar a lista.');
        }
    };

    const navegarParaReceitas = (listaId: string) => {
        navigation.navigate('Receitas da lista', { listaId });
    };

    const navegarParaReceitasFavoritas = () => {
        navigation.navigate('Receitas favoritas', { uid: uidUsuario });
    };

    return (
        <View style={styles.container}>
            {favoritos.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Favoritos</Text>
                    <FlatList
                        data={favoritos}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={navegarParaReceitasFavoritas} style={styles.listaItem}>
                                <Text style={styles.listaNome}>{favoritos[0].nome}</Text>
                                <Text style={styles.listaCount}>
                                    {favoritos[0].totalReceitas} {favoritos[0].totalReceitas === 1 ? 'receita' : 'receitas'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </>
            )}

            <Text style={styles.sectionTitle}>Minhas Listas</Text>
            <FlatList
                data={listas}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.listaItemContainer}>
                        <TouchableOpacity onPress={() => navegarParaReceitas(item.id)} style={styles.listaItem}>
                            {editingListaId === item.id ? (
                                <TextInput
                                    value={nomeListaEditando}
                                    onChangeText={setNomeListaEditando}
                                    style={styles.input}
                                    onSubmitEditing={finalizarEdicao} // Finaliza a edição ao pressionar "Enter"
                                />
                            ) : (
                                <>
                                    <Text style={styles.listaNome}>{item.nome}</Text>
                                    <Text style={styles.listaCount}>{item.totalReceitas} {item.totalReceitas === 1 ? 'receita' : 'receitas'}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => excluirLista(item.id)} style={styles.deleteButton}>
                            <FontAwesome name="trash" size={24} color="black" />
                        </TouchableOpacity>
                        {editingListaId === item.id ? (
                            <TouchableOpacity onPress={finalizarEdicao} style={styles.editButton}>
                                <Text style={styles.editButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => iniciarEdicao(item.id, item.nome)} style={styles.editButton}>
                                <FontAwesome name="pencil" size={24} color="black" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal isVisible={modalVisible}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Criar lista</Text>
                    <TextInput
                        value={nomeLista}
                        onChangeText={setNomeLista}
                        placeholder="Nome da Lista"
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={criarLista} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Criar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    listaItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listaItem: {
        flex: 1,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    listaNome: {
        fontSize: 18,
    },
    listaCount: {
        color: '#666',
    },
    deleteButton: {
        padding: 10,
    },
    editButton: {
        padding: 10,
    },
    editButtonText: {
        color: 'black',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#FC7493',
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabText: {
        fontSize: 30,
        color: '#fff',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#FC7493',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    modalButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
});

export default Listas;
