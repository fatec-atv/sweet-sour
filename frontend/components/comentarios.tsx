import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config';

interface Comentario {
    id: string;
    usuarioId: string; // Altere para incluir usuarioId
    usuarioNome: string;
    comentario: string;
}

const ComentariosReceita: React.FC<{ idReceita: string }> = ({ idReceita }) => {
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchComentarios = async () => {
        try {
            console.log('Buscando comentários para a receita:', idReceita);
            const comentariosRef = collection(db, 'comentarios');
            const q = query(comentariosRef, where('receitaId', '==', idReceita));
    
            const querySnapshot = await getDocs(q);
            console.log('Snapshot dos comentários:', querySnapshot);
    
            const comentariosComNomes = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();
                let usuarioNome = 'Usuário não encontrado'; // Valor padrão para nome do usuário
    
                // Verifica se o usuarioId está presente
                if (data.usuarioId) {
                    // Buscando o nome do usuário
                    const usuariosRef = collection(db, 'usuarios');
                    const userQuery = query(usuariosRef, where('uid', '==', data.usuarioId));
                    const userSnapshot = await getDocs(userQuery);
    
                    if (!userSnapshot.empty) {
                        userSnapshot.forEach((userDoc) => {
                            console.log("Usuário encontrado:", userDoc.data());
                            usuarioNome = userDoc.data().nome; // Armazena o nome do usuário
                        });
                    } else {
                        console.warn(`Usuário não encontrado para ID: ${data.usuarioId}`);
                    }
                } else {
                    console.warn(`usuarioId não encontrado para o comentário ID: ${docSnapshot.id}`);
                }
    
                // Retorna o objeto de comentário com o nome do usuário
                return {
                    id: docSnapshot.id,
                    usuarioId: data.usuarioId || '', // Pode ser vazio ou um valor padrão
                    usuarioNome, // Usando o nome do usuário encontrado
                    comentario: data.comentario,
                };
            }));
    
            setComentarios(comentariosComNomes);
            console.log('Comentários recuperados:', comentariosComNomes);
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
            Alert.alert('Erro', 'Não foi possível carregar os comentários.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchComentarios();
    }, [idReceita]);
    


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando comentários...</Text>
            </View>
        );
    }

    if (comentarios.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum comentário encontrado.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {comentarios.map((comentario) => (
                <View key={comentario.id} style={styles.card}>
                    <Text style={styles.usuarioNome}>{comentario.usuarioNome}</Text>
                    <Text style={styles.comentario}>{comentario.comentario}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
    card: {
        padding: 10,
        marginVertical: 8,
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
    },
    usuarioNome: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    comentario: {
        fontSize: 16,
    },
});

export default ComentariosReceita;
