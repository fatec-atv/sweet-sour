import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native';
import { collection, query, getDocs, doc, where, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config';
import ReceitaItem from '../listagemReceita/ReceitaItem';

interface Receita {
    id: string;
    titulo: string;
    categoria: string;
    imagem: string | null;
}

const ReceitasFavoritas: React.FC<{ route: any }> = ({ route }) => {
    const { uid } = route.params; // Recebendo o uid através das rotas
    const [receitasFavoritas, setReceitasFavoritas] = useState<Receita[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchFavoritas = async () => {
            try {
                // Obtendo os documentos da coleção 'favoritos' para o usuário
                const favoritosQuery = query(collection(db, 'favoritos'), where('usuarioId', '==', uid));
                const querySnapshot = await getDocs(favoritosQuery);
                const listaReceitas: Receita[] = [];

                // Loop pelos documentos da coleção 'favoritos' para buscar cada receita na coleção principal
                for (const favoritoDoc of querySnapshot.docs) {
                    const receitaId = favoritoDoc.data().receitaId;

                    if (receitaId) {
                        // Buscando detalhes da receita na coleção principal 'receitas'
                        const receitaDoc = await getDoc(doc(db, 'receitas', receitaId));
                        if (receitaDoc.exists()) {
                            const receitaData = receitaDoc.data();

                            // Adiciona os dados da receita ao array
                            listaReceitas.push({
                                id: receitaId,
                                titulo: receitaData.titulo || 'Sem título',
                                categoria: receitaData.categoria || 'Sem categoria',
                                imagem: receitaData.imagem || null,
                            } as Receita);
                        } else {
                            console.log(`Receita com ID ${receitaId} não encontrada.`);
                        }
                    }
                }

                // Atualiza o estado com as receitas favoritas completas
                setReceitasFavoritas(listaReceitas);
            } catch (error) {
                console.error('Erro ao buscar receitas favoritas:', error);
                Alert.alert('Erro', 'Não foi possível buscar as receitas favoritas.');
            } finally {
                setLoading(false);
            }
        };

        fetchFavoritas();
    }, [uid]);

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
                    data={receitasFavoritas}
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

export default ReceitasFavoritas;
