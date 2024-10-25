import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native';
import { collection, query, getDocs, getDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config';
import ReceitaItem from '../listagemReceita/ReceitaItem';

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
    const navigation = useNavigation();

    useEffect(() => {
        const fetchReceitas = async () => {
            try {
                // Obtendo os documentos da subcoleção 'receitas' na lista especificada
                const receitasQuery = query(collection(db, 'listas', listaId, 'receitas'));
                const querySnapshot = await getDocs(receitasQuery);
                const listaReceitas: Receita[] = [];

                // Loop pelos documentos da subcoleção 'receitas' para buscar cada receita na coleção principal
                for (const receitaDocRef of querySnapshot.docs) {
                    const id = receitaDocRef.data().receitaId;

                    if (id) {
                        // Buscando detalhes da receita na coleção principal 'receitas'
                        const receitaDoc = await getDoc(doc(db, 'receitas', id));
                        if (receitaDoc.exists()) {
                            const receitaData = receitaDoc.data();

                            // Adiciona os dados da receita ao array
                            listaReceitas.push({
                                id: id,
                                titulo: receitaData.titulo || 'Sem título',
                                categoria: receitaData.categoria || 'Sem categoria',
                                imagem: receitaData.imagem || null,
                            } as Receita);
                        } else {
                            console.log(`Receita com ID ${id} não encontrada.`);
                        }
                    }
                }

                // Atualiza o estado com as receitas completas
                setReceitas(listaReceitas);
            } catch (error) {
                console.error('Erro ao buscar receitas:', error);
                Alert.alert('Erro', 'Não foi possível buscar as receitas.');
            } finally {
                setLoading(false);
            }
        };

        fetchReceitas();
    }, [listaId]);

    const renderItem = ({ item }: { item: Receita }) => (
        <ReceitaItem item={item} onPress={() => navigation.navigate('VisualizacaoReceita', { id: item.id })} />
    );
    

    return (
        <View style={styles.container}>
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
});

export default ReceitasListas;
