import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { collection, query, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config';
import ReceitaItem from '../listagemReceita/ReceitaItem';
import { FontAwesome } from '@expo/vector-icons';


interface Receita {
    id: string;
    titulo: string;
    categoria: string;
    imagem: string | null;
}

const ReceitasListas: React.FC<{ route: any }> = ({ route }) => {
    const { listaId } = route.params;
    const [receitas, setReceitas] = useState<Receita[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modoExclusao, setModoExclusao] = useState<boolean>(false);
    const [receitasSelecionadas, setReceitasSelecionadas] = useState<string[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        fetchReceitas();
    }, [listaId]);

    const fetchReceitas = async () => {
        setLoading(true);
        try {
            const receitasQuery = query(collection(db, 'listas', listaId, 'receitas'));
            const querySnapshot = await getDocs(receitasQuery);
            
            const listaReceitas: Receita[] = [];
    
            for (const receitaDocRef of querySnapshot.docs) {
                // Aqui estamos pegando o receitaId que está armazenado no documento da subcoleção 'receitas'
                const receitaData = receitaDocRef.data();
                const receitaId = receitaData.receitaId;
    
                if (receitaId) {
                    // Agora, buscamos o documento correspondente na coleção 'receitas'
                    const receitaDoc = await getDoc(doc(db, 'receitas', receitaId));
                    if (receitaDoc.exists()) {
                        const receitaDetails = receitaDoc.data();
    
                        listaReceitas.push({
                            id: receitaId, // Usamos o receitaId correto aqui
                            titulo: receitaDetails.titulo || 'Sem título',
                            categoria: receitaDetails.categoria || 'Sem categoria',
                            imagem: receitaDetails.imagem || null,
                        } as Receita);
                    }
                }
            }
    
            setReceitas(listaReceitas);
        } catch (error) {
            console.error('Erro ao buscar receitas:', error);
            Alert.alert('Erro', 'Não foi possível buscar as receitas.');
        } finally {
            setLoading(false);
        }
    };
    
    const excluirReceitasSelecionadas = async () => {
        try {
            // Busca todos os documentos da subcoleção 'receitas' da lista para mapear os IDs
            const receitasQuery = query(collection(db, 'listas', listaId, 'receitas'));
            const querySnapshot = await getDocs(receitasQuery);
    
            // Cria um mapa de receitaId para documentId
            const receitasMap = {};
            querySnapshot.docs.forEach(doc => {
                const receitaData = doc.data();
                const receitaId = receitaData.receitaId; // ID da receita que está na coleção 'receitas'
                const docId = doc.id; // ID do documento na subcoleção 'receitas'
                if (receitaId) {
                    receitasMap[receitaId] = docId; // Mapeia o receitaId para o ID do documento
                }
            });
    
            // Deleta cada documento de receita selecionado na subcoleção 'receitas' da lista
            for (const receitaId of receitasSelecionadas) {
                const docId = receitasMap[receitaId]; // Pega o ID do documento correspondente
                if (docId) {
                    const receitaDocRef = doc(db, 'listas', listaId, 'receitas', docId);
                    console.log(`Excluindo documento: ${receitaDocRef.path}`);
                    await deleteDoc(receitaDocRef);
                } else {
                    console.warn(`Documento não encontrado para exclusão: receitaId ${receitaId}`);
                }
            }
    
            // Atualiza o estado local para remover os itens da interface após a exclusão
            setReceitas((prevReceitas) =>
                prevReceitas.filter((receita) => !receitasSelecionadas.includes(receita.id))
            );
            
            // Limpa a seleção e desativa o modo de exclusão
            setReceitasSelecionadas([]);
            setModoExclusao(false);
    
            Alert.alert('Sucesso', 'Receitas removidas da lista no banco de dados.');
        } catch (error) {
            console.error('Erro ao excluir receitas:', error);
            Alert.alert('Erro', 'Não foi possível remover as receitas da lista no banco de dados.');
        }
    };   
    
    
    

    const toggleSelecionarReceita = (receitaId: string) => {
        if (receitasSelecionadas.includes(receitaId)) {
            setReceitasSelecionadas((prev) => prev.filter((id) => id !== receitaId));
        } else {
            setReceitasSelecionadas((prev) => [...prev, receitaId]);
        }
    };

    const renderItem = ({ item }: { item: Receita }) => (
        <TouchableOpacity
            onPress={() => (modoExclusao ? toggleSelecionarReceita(item.id) : navigation.navigate('VisualizacaoReceita', { id: item.id }))}
            style={[
                styles.receitaContainer,
                receitasSelecionadas.includes(item.id) && styles.receitaSelecionada,
            ]}
        >
            <ReceitaItem
                item={item}
                onPress={() => navigation.navigate('VisualizacaoReceita', { id: item.id })}
            />
            <View style={styles.receitaTextContainer}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.categoria}>{item.categoria}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.titulo}>Receitas</Text>
                <TouchableOpacity onPress={() => setModoExclusao(!modoExclusao)}>
                    <FontAwesome name="trash" size={24} color={modoExclusao ? "red" : "black"} />
                </TouchableOpacity>
                {modoExclusao && receitasSelecionadas.length > 0 && (
                    <TouchableOpacity onPress={excluirReceitasSelecionadas} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>Excluir Selecionados</Text>
                    </TouchableOpacity>
                )}
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : (
                <FlatList
                    data={receitas}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFAFB',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFAFB',
    },
    loadingText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    receitaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    receitaSelecionada: {
        backgroundColor: '#FFEBEB',
        borderColor: 'red',
        borderWidth: 1,
    },
    receitaTextContainer: {
        marginLeft: 10,
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ReceitasListas;
