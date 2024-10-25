import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config';

const Listas: React.FC = () => {
    const [listas, setListas] = useState<any[]>([]);
    const [favoritos, setFavoritos] = useState<any[]>([]);
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
                fetchFavoritos(storedUserId); // Chama a função para buscar favoritos
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
    
        // O total de receitas é igual ao número de documentos encontrados
        const totalReceitas = querySnapshot.size;
    
        // Agora, vamos criar um único objeto de favoritos que inclui o total de receitas
        favoritosData.push({
            id: 'favoritos', // Um ID único para a seção de favoritos
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

    const navegarParaReceitas = (listaId: string) => {
        navigation.navigate('Receitas da lista', { listaId });
    };

    const navegarParaReceitasFavoritas = () => {
        navigation.navigate('Receitas favoritas', { uid: uidUsuario }); // Navega para a página de Receitas Favoritas
    };
    

    return (
        <View style={styles.container}>
            {/* Se houver listas de favoritos, exibe a seção de favoritos */}
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
                    <TouchableOpacity onPress={() => navegarParaReceitas(item.id)} style={styles.listaItem}>
                        <Text style={styles.listaNome}>{item.nome}</Text>
                        <Text style={styles.listaCount}>{item.totalReceitas} {item.totalReceitas === 1 ? 'receita' : 'receitas'}</Text>
                    </TouchableOpacity>
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
    listaItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    listaNome: {
        fontSize: 18,
    },
    listaCount: {
        fontSize: 14,
        color: '#888',
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
});

export default Listas;
