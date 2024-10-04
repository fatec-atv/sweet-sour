import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../config'; // Importando a configuração do Firebase
import { collection, addDoc } from 'firebase/firestore';

const Comentar = ({ route, navigation }) => {
    const { idReceita } = route.params || {}; // Recebendo apenas o ID da receita
    const [comentario, setComentario] = useState('');
    const [uidUsuario, setUidUsuario] = useState<string | null>(null); // Estado para armazenar o UID do usuário

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('uid');
                if (storedUserId) {
                    setUidUsuario(storedUserId);
                    console.log('UID do usuário recuperado:', storedUserId);
                } else {
                    console.log('UID do usuário não encontrado no AsyncStorage');
                }
            } catch (error) {
                console.error('Erro ao recuperar o UID do usuário:', error);
            }
        };

        fetchUserId();
    }, []);

    const enviarComentario = async () => {
        if (!idReceita || !uidUsuario) {
            Alert.alert('Erro', 'ID da receita ou UID do usuário não encontrado.');
            return;
        }

        if (comentario.trim() === '') {
            Alert.alert('Erro', 'Por favor, escreva um comentário.');
            return;
        }

        try {
            await addDoc(collection(db, 'comentarios'), {
                receitaId: idReceita,
                usuarioId: uidUsuario,
                comentario: comentario,
                createdAt: new Date(),
            });

            console.log('Comentário enviado com sucesso!, comentario:', comentario, uidUsuario, idReceita);

            Alert.alert('Sucesso', 'Comentário enviado com sucesso!');
            setComentario('');
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            Alert.alert('Erro', 'Não foi possível enviar seu comentário. Tente novamente.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Comentário:</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                placeholder="Escreva seu comentário aqui..."
                value={comentario}
                onChangeText={setComentario}
            />
            <TouchableOpacity style={styles.button} onPress={enviarComentario}>
                <Text style={styles.buttonText}>Enviar Comentário</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderColor: '#C5C5C5',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: '#F5F5F5',
    },
    textArea: {
        height: 100,
        marginBottom: 15,
        paddingVertical: 10,
        paddingHorizontal: 15,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#FC7493',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        width: 300,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Comentar;
[]