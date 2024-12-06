import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, where, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config';
import { useNavigation } from '@react-navigation/native';

const ModalReceita: React.FC<{ modalVisible: boolean; toggleModal: () => void; idReceita: string }> = ({ modalVisible, toggleModal, idReceita }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [uidUsuario, setUidUsuario] = useState<string | null>(null);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const navigation = useNavigation();

    const localServerIP = '192.168.9.186';

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('uid');
                if (storedUserId) {
                    setUidUsuario(storedUserId);
                    console.log('UID do usuário recuperado:', storedUserId);
                    checkIfFavorited(storedUserId);
                    fetchUserRating(storedUserId);
                    fetchAverageRating();
                }
            } catch (error) {
                console.error('Erro ao recuperar o UID do usuário:', error);
            }
        };

        if (modalVisible) {
            fetchUserId();
        }
    }, [modalVisible]);

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
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Erro ao verificar se a receita já está favoritada:', error);
        }
    };

    const fetchUserRating = async (uidUsuario: string) => {
        if (!idReceita) return;

        const userRatingQuery = query(
            collection(db, 'avaliacoes'),
            where('receitaId', '==', idReceita),
            where('usuarioId', '==', uidUsuario)
        );

        try {
            const querySnapshot = await getDocs(userRatingQuery);
            if (!querySnapshot.empty) {
                const userRatingDoc = querySnapshot.docs[0];
                setUserRating(userRatingDoc.data().rating);
            }
        } catch (error) {
            console.error('Erro ao buscar a avaliação do usuário:', error);
        }
    };

    const fetchAverageRating = async () => {
        if (!idReceita) return;

        const ratingsQuery = query(
            collection(db, 'avaliacoes'),
            where('receitaId', '==', idReceita)
        );

        try {
            const querySnapshot = await getDocs(ratingsQuery);
            let totalRating = 0;
            let ratingCount = 0;

            querySnapshot.forEach((doc) => {
                totalRating += doc.data().rating;
                ratingCount += 1;
            });

            if (ratingCount > 0) {
                setAverageRating(totalRating / ratingCount);
            } else {
                setAverageRating(null);
            }
        } catch (error) {
            console.error('Erro ao buscar a média das avaliações:', error);
        }
    };

    const handleRating = async (rating: number) => {
        if (!idReceita || !uidUsuario) {
            Alert.alert('Erro', 'ID da receita ou UID do usuário não encontrado.');
            return;
        }

        const userRatingQuery = query(
            collection(db, 'avaliacoes'),
            where('receitaId', '==', idReceita),
            where('usuarioId', '==', uidUsuario)
        );

        try {
            const querySnapshot = await getDocs(userRatingQuery);
            if (!querySnapshot.empty) {
                const userRatingDoc = querySnapshot.docs[0];
                await updateDoc(userRatingDoc.ref, {
                    rating: rating,
                    avaliadoEm: new Date(),
                });
            } else {
                await addDoc(collection(db, 'avaliacoes'), {
                    receitaId: idReceita,
                    usuarioId: uidUsuario,
                    rating: rating,
                    avaliadoEm: new Date(),
                });
            }

            setUserRating(rating);
            fetchAverageRating();
            Alert.alert('Sucesso', 'Avaliação registrada com sucesso.');
        } catch (error) {
            console.error('Erro ao registrar a avaliação:', error);
            Alert.alert('Erro', 'Não foi possível registrar a avaliação. Tente novamente.');
        }
    };

    const handleFavorite = async () => {
        if (!idReceita || !uidUsuario) {
            Alert.alert('Erro', 'ID da receita ou UID do usuário não encontrado.');
            return;
        }

        try {
            if (isFavorited) {
                const favoritosQuery = query(
                    collection(db, 'favoritos'),
                    where('usuarioId', '==', uidUsuario),
                    where('receitaId', '==', idReceita)
                );
                const querySnapshot = await getDocs(favoritosQuery);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach(async (doc) => {
                        await deleteDoc(doc.ref);
                    });
                }
                setIsFavorited(false);
                Alert.alert('Sucesso', 'Receita removida dos favoritos.');
            } else {
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

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `Confira esta receita incrível: http://${localServerIP}:3000/receita/${idReceita}`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Compartilhado com atividade:', result.activityType);
                } else {
                    console.log('Compartilhado');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Compartilhamento cancelado');
            }
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            Alert.alert('Erro', 'Não foi possível compartilhar o link. Tente novamente.');
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

                        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                            <Icon name="share" size={30} color="#FC7493" />
                            <Text style={styles.iconLabel}>Compartilhar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                                <Icon
                                    name={userRating && userRating >= star ? 'star' : 'star-border'}
                                    size={30}
                                    color="#FC7493"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {averageRating !== null && (
                        <Text style={styles.averageRatingText}>Avaliação média: {averageRating.toFixed(1)}</Text>
                    )}

                    <TouchableOpacity
                        onPress={() => {
                            toggleModal();
                            navigation.navigate('Comentarios', { idReceita });
                        }}
                        style={styles.commentButton}
                    >
                        <Text style={styles.commentButtonText}>Ver Comentários</Text>
                    </TouchableOpacity>

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
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        justifyContent: 'space-around',
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
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    averageRatingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
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