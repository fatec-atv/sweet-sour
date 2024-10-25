import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config';
import { useNavigation } from '@react-navigation/native';

const ModalReceita: React.FC<{ modalVisible: boolean; toggleModal: () => void; idReceita: string }> = ({ modalVisible, toggleModal, idReceita }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [uidUsuario, setUidUsuario] = useState<string | null>(null);
    const navigation = useNavigation();

    // Função para recuperar o UID do usuário armazenado
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('uid');
                if (storedUserId) {
                    setUidUsuario(storedUserId);
                    console.log('UID do usuário recuperado:', storedUserId);
                    checkIfFavorited(storedUserId);
                }
            } catch (error) {
                console.error('Erro ao recuperar o UID do usuário:', error);
            }
        };

        if (modalVisible) {
            fetchUserId();
        }
    }, [modalVisible]);

    // Função para verificar se a receita já está favoritada no Firestore
    const checkIfFavorited = async (uidUsuario: string) => {
        if (!idReceita || !uidUsuario) return;

        const favoritosQuery = query(
            collection(db, 'favoritos'),
            where('usuarioId', '==', uidUsuario),
            where('receitaId', '==', idReceita)
        );

        try {
            const querySnapshot = await getDocs(favoritosQuery);
            if (!querySnapshot.empty) {
                setIsFavorited(true); // Se encontrar o favorito, já está favoritado
            }
        } catch (error) {
            console.error('Erro ao verificar se a receita já está favoritada:', error);
        }
    };

    // Função para favoritar/desfavoritar a receita
    const handleFavorite = async () => {
        if (!idReceita || !uidUsuario) {
            Alert.alert('Erro', 'ID da receita ou UID do usuário não encontrado.');
            return;
        }

        try {
            if (isFavorited) {
                // Se já está favoritado, remove dos favoritos
                const favoritosQuery = query(
                    collection(db, 'favoritos'),
                    where('usuarioId', '==', uidUsuario),
                    where('receitaId', '==', idReceita)
                );
                const querySnapshot = await getDocs(favoritosQuery);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref); // Remove o documento do Firestore
                    });
                }
                setIsFavorited(false);
                Alert.alert('Sucesso', 'Receita removida dos favoritos.');
            } else {
                // Se não está favoritado, adiciona aos favoritos
                await addDoc(collection(db, 'favoritos'), {
                    receitaId: idReceita,
                    usuarioId: uidUsuario,
                    favoritadoEm: new Date(),
                });
                setIsFavorited(true);
                Alert.alert('Sucesso', 'Receita adicionada aos favoritos.');
            }
        } catch (error) {
            console.error('Erro ao favoritar/desfavoritar:', error);
            Alert.alert('Erro', 'Não foi possível realizar a operação. Tente novamente.');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={toggleModal}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Menu de ícones e botões */}
                    <View style={styles.iconRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleFavorite}>
                            <Icon
                                name={isFavorited ? 'favorite' : 'favorite-border'}
                                size={30}
                                color={isFavorited ? '#FC7493' : '#FC7493'}
                            />
                            <Text style={styles.iconLabel}>Favoritar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Adicionar à Lista', { idReceita })}>
                            <Icon name="playlist-add" size={30} color="#FC7493" />
                            <Text style={styles.iconLabel}>Adicionar à Lista</Text>
                        </TouchableOpacity>


                        <TouchableOpacity onPress={() => navigation.navigate('Comentar', { idReceita, uidUsuario })} style={styles.iconButton}>
                            <Icon name="comment" size={30} color="#FC7493" />
                            <Text style={styles.iconLabel}>Comentar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botão para ver comentários */}
                    <TouchableOpacity
                        onPress={() => {
                            toggleModal();
                            navigation.navigate('Comentarios', { idReceita });
                        }}
                        style={styles.commentButton}
                    >
                        <Text style={styles.commentButtonText}>Ver Comentários</Text>
                    </TouchableOpacity>

                    {/* Botão para fechar o modal */}
                    <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Modal desce a partir do fundo
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro semitransparente
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Ícones espaçados uniformemente
        marginBottom: 20,
    },
    iconButton: {
        alignItems: 'center',
    },
    iconLabel: {
        marginTop: 8,
        fontSize: 14,
        color: '#333',
    },
    commentButton: {
        paddingVertical: 10,
        backgroundColor: '#FC7493',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    commentButtonText: {
        color: 'white',
        fontSize: 16,
    },
    closeButton: {
        alignItems: 'center',
        padding: 10,
    },
    closeButtonText: {
        color: '#FC7493',
        fontSize: 16,
    },
});

export default ModalReceita;