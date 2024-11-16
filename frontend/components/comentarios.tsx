import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput, Modal } from 'react-native';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

interface Comentario {
    id: string;
    usuarioId: string;
    usuarioNome: string;
    comentario: string;
    imagem: string | null;
}

const ComentariosReceita: React.FC<{ idReceita: string }> = ({ idReceita }) => {
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [uidUsuario, setUidUsuario] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [comentarioEditado, setComentarioEditado] = useState<string>('');
    const [imagemEditada, setImagemEditada] = useState<string | null>(null);
    const [comentarioIdEditado, setComentarioIdEditado] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('uid');
                if (storedUserId) {
                    setUidUsuario(storedUserId);
                }
            } catch (error) {
                console.error('Erro ao recuperar o UID do usuário:', error);
            }
        };

        fetchUserId();
    }, []);

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
                    imagem: data.imagem || null, // Inclui a imagem se estiver presente
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

    const selecionarImagem = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImagemEditada(result.assets[0].uri);
        }
    };

    const editarComentario = (comentarioId: string, comentarioAtual: string, imagemAtual: string | null) => {
        setComentarioIdEditado(comentarioId);
        setComentarioEditado(comentarioAtual);
        setImagemEditada(imagemAtual);
        setModalVisible(true);
    };

    const salvarEdicaoComentario = async () => {
        if (comentarioIdEditado) {
            try {
                const comentarioRef = doc(db, 'comentarios', comentarioIdEditado);
                await updateDoc(comentarioRef, {
                    comentario: comentarioEditado,
                    imagem: imagemEditada || null,
                });
                setComentarios(comentarios.map(comentario => 
                    comentario.id === comentarioIdEditado ? { ...comentario, comentario: comentarioEditado, imagem: imagemEditada } : comentario
                ));
                setModalVisible(false);
                Alert.alert('Sucesso', 'Comentário editado com sucesso!');
            } catch (error) {
                console.error('Erro ao editar comentário:', error);
                Alert.alert('Erro', 'Não foi possível editar o comentário. Tente novamente.');
            }
        }
    };

    const confirmarDelecaoComentario = (comentarioId: string) => {
        Alert.alert(
            'Confirmar Deleção',
            'Você tem certeza que deseja deletar este comentário?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Deletar',
                    onPress: () => deletarComentario(comentarioId),
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    const deletarComentario = async (comentarioId: string) => {
        try {
            await deleteDoc(doc(db, 'comentarios', comentarioId));
            setComentarios(comentarios.filter(comentario => comentario.id !== comentarioId));
            Alert.alert('Sucesso', 'Comentário deletado com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar comentário:', error);
            Alert.alert('Erro', 'Não foi possível deletar o comentário. Tente novamente.');
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
                    {comentario.imagem && <Image source={{ uri: comentario.imagem }} style={styles.comentarioImagem} />}
                    {comentario.usuarioId === uidUsuario && (
                        <View style={styles.iconContainer}>
                            <TouchableOpacity onPress={() => editarComentario(comentario.id, comentario.comentario, comentario.imagem)}>
                                <Icon name="edit" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => confirmarDelecaoComentario(comentario.id)}>
                                <Icon name="delete" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ))}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Editar Comentário</Text>
                    <TextInput
                        style={styles.input}
                        value={comentarioEditado}
                        onChangeText={setComentarioEditado}
                    />
                    <TouchableOpacity style={styles.button} onPress={selecionarImagem}>
                        <Text style={styles.buttonText}>Selecionar Imagem</Text>
                    </TouchableOpacity>
                    {imagemEditada && <Image source={{ uri: imagemEditada }} style={styles.comentarioImagem} />}
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={salvarEdicaoComentario}
                    >
                        <Text style={styles.textStyle}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
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
    comentarioImagem: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    modalView: {
        margin: 20,
        marginTop: 50, // Adiciona espaçamento na parte superior
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: '#FC7493', // Cor rosinha para o botão
        marginTop: 10,
    },
    buttonClose: {
        backgroundColor: '#FC7493', // Cor rosinha para o botão "Salvar"
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '100%',
    },
});

export default ComentariosReceita;