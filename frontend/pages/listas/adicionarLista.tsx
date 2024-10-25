import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config';

const AdicionarListas: React.FC<{ route: any }> = ({ route }) => {
    const { idReceita } = route.params; // Obter o idReceita da rota
    const [listas, setListas] = useState<any[]>([]);
    const [uidUsuario, setUidUsuario] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [nomeLista, setNomeLista] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserIdAndListas = async () => {
            const storedUserId = await AsyncStorage.getItem('uid');
            if (storedUserId) {
                setUidUsuario(storedUserId);
                fetchListas(storedUserId);
            }
        };
        fetchUserIdAndListas();
    }, []);

    // Função para buscar listas do Firestore
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
                totalReceitas: receitasSnapshot.size || 0, // Assegurar que sempre retorne um número
            });
        }

        setListas(listasData);
    };

    // Função para adicionar a receita a uma lista
    const adicionarALista = async (listaId: string) => {
        try {
            await addDoc(collection(db, 'listas', listaId, 'receitas'), {
                receitaId: idReceita,
                usuarioId: uidUsuario,
            });
            Alert.alert('Sucesso', 'Receita adicionada à lista.');
        } catch (error) {
            console.error('Erro ao adicionar à lista:', error);
            Alert.alert('Erro', 'Não foi possível adicionar à lista.');
        }
    };

    // Função para criar nova lista
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
            fetchListas(uidUsuario); // Atualizar listas
            Alert.alert('Sucesso', 'Lista criada com sucesso.');
        } catch (error) {
            console.error('Erro ao criar lista:', error);
            Alert.alert('Erro', 'Não foi possível criar a lista.');
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={listas}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => adicionarALista(item.id)} style={styles.listaItem}>
                        <Text style={styles.listaNome}>{item.nome}</Text>
                        <Text style={styles.listaCount}>
                            {item.totalReceitas !== undefined && item.totalReceitas !== null ? 
                                `${item.totalReceitas} ${item.totalReceitas === 1 ? 'receita' : 'receitas'}` 
                                : '0 receitas'}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Modal para criar nova lista */}
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
    listaItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    listaNome: {
        fontSize: 18,
    },
    addButton: {
        backgroundColor: '#FC7493',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    modalButton: {
        backgroundColor: '#FC7493',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'center',
        width: 100,
    },
    modalButtonText: {
        color: '#fff',
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
    listaCount: {
        fontSize: 14,
        color: '#888',
    },
});

export default AdicionarListas;
