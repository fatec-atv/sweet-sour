import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { authFirebase } from '../../config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
    const [value, setValue] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigation();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(authFirebase, value.email, value.password);
            const userId = userCredential.user.uid;

            await AsyncStorage.setItem('uid', userId);

            setValue({ email: "", password: "" });
            navigate.navigate("Home");

        } catch (error) {
            console.error("Erro ao tentar realizar o login:", error.message);
            Alert.alert("Erro ao tentar realizar o login", error.message);
        }
    };

    useEffect(() => {
        const checkUserId = async () => {
            const storedUserId = await AsyncStorage.getItem('uid');
            console.log("UID armazenado no AsyncStorage:", storedUserId);
        };

        checkUserId();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={require('../../assets/images/sweet_sour.png')} style={styles.sweetsour} />
                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            </View>

            <Text style={styles.label}>E-mail</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Insira seu e-mail"
                    value={value.email}
                    onChangeText={(text) => setValue({ ...value, email: text })}
                />
            </View>

            <Text style={styles.label}>Senha</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Insira sua senha"
                    secureTextEntry
                    value={value.password}
                    onChangeText={(text) => setValue({ ...value, password: text })}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.txt}>Não possui uma conta?</Text>

            <TouchableOpacity onPress={() => navigate.navigate('CadastroUsuario')}>
                <Text style={styles.signUpText}>Cadastre-se aqui!</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#FFFAFB',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E282A',
        marginBottom: 20,
        textAlign: 'center',
    },
    form: {
        flex: 1,
        flexDirection: 'column',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
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
    passwordInput: {
        marginTop: 0,
    },
    button: {
        backgroundColor: '#FC7493',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        width: `40%`,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signUpText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    sweetsour: {
        width: 400,
        height: 400,
        resizeMode: 'contain',
        marginTop: -100,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        marginTop: -160,
    },
    imageContainer: {
        alignItems: 'center'
    },
    txt: {
        fontSize: 16,
        marginTop: 20,
        color: '#000',
        textAlign: 'center',
    },
});

export default Login;
