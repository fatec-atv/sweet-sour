import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importando useNavigation

const ModalReceita: React.FC<{ modalVisible: boolean; toggleModal: () => void; idReceita: string; uidUsuario: string; }> = ({ modalVisible, toggleModal, idReceita, uidUsuario }) => {
    const navigation = useNavigation();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={toggleModal}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Menu de Reviews</Text>

                    <TouchableOpacity onPress={() => navigation.navigate('Comentarios', { idReceita })} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Ver Comentários</Text>
                    </TouchableOpacity>


                    <TouchableOpacity onPress={() => navigation.navigate('Comentar', { idReceita, uidUsuario })} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Comentar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleModal} style={styles.modalButton}>
                        <Text style={styles.modalButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        padding: 10,
        backgroundColor: '#FC7493',
        borderRadius: 5,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default ModalReceita;
