import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../config'; // Importando a configuração do Firebase
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    Comentar: { idReceita: string };
};

type ComentarScreenRouteProp = RouteProp<RootStackParamList, 'Comentar'>;
type ComentarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Comentar'>;

type Props = {
    route: ComentarScreenRouteProp;
    navigation: ComentarScreenNavigationProp;
};

const Comentar: React.FC<Props> = ({ route, navigation }) => {
    const { idReceita } = route.params || {}; // Recebendo apenas o ID da receita
    const [comentario, setComentario] = useState('');
    const [uidUsuario, setUidUsuario] = useState<string | null>(null); // Estado para armazenar o UID do usuário
    const [imagem, setImagem] = useState<string | null>(null); // Estado para armazenar a imagem selecionada

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

    const selecionarImagem = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImagem(result.assets[0].uri);
        }
    };

    const enviarComentario = async () => {
        if (!idReceita || !uidUsuario) {
            Alert.alert('Erro', 'ID da receita ou UID do usuário não encontrado.');
            return;
        }

        if (comentario.trim() === '' && !imagem) {
            Alert.alert('Erro', 'Por favor, escreva um comentário ou selecione uma imagem.');
            return;
        }

        try {
            await addDoc(collection(db, 'comentarios'), {
                receitaId: idReceita,
                usuarioId: uidUsuario,
                comentario: comentario,
                imagem: imagem || null,
                createdAt: new Date(),
            });

            console.log('Comentário enviado com sucesso!, comentario:', comentario, uidUsuario, idReceita, imagem);

            Alert.alert('Sucesso', 'Comentário enviado com sucesso!');
            setComentario('');
            setImagem(null);
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao enviar comentário:', error);
            Alert.alert('Erro', 'Não foi possível enviar seu comentário. Tente novamente.');
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                    <TouchableOpacity style={styles.button} onPress={selecionarImagem}>
                        <Text style={styles.buttonText}>Selecionar Imagem</Text>
                    </TouchableOpacity>
                    {imagem && <Image source={{ uri: imagem }} style={styles.image} />}
                    <TouchableOpacity style={styles.button} onPress={enviarComentario}>
                        <Text style={styles.buttonText}>Enviar Comentário</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-start', // Alinha o conteúdo no topo
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
    image: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginTop: 20,
    },
});

export default Comentar;