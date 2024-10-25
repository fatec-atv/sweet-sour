import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ComentariosReceita from '../../components/comentarios';

const TelaComentarios: React.FC = () => {
  const route = useRoute();
  const { idReceita } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comentários</Text>
      <ComentariosReceita idReceita={idReceita} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFAFB',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default TelaComentarios;