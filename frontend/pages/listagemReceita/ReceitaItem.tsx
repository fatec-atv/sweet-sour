import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface Receita {
  id: string;
  titulo: string;
  categoria: string;
  imagem: string | null;
}

interface ReceitaItemProps {
  item: Receita;
  onPress: () => void;
}

const ReceitaItem: React.FC<ReceitaItemProps> = ({ item, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.cardContainer, isHovered && styles.cardHovered]}
      onPress={onPress}
      onPressIn={() => setIsHovered(true)}
      onPressOut={() => setIsHovered(false)}
    >
      <View style={styles.cardContent}>
        {/* Layout com imagem à esquerda e texto à direita */}
        {item.imagem ? (
          <Image source={{ uri: item.imagem }} style={styles.cardImage} />
        ) : (
          <Text style={styles.noImageText}>Imagem não disponível</Text>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <Text style={styles.cardCategory}>{item.categoria}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#FFBECD',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  cardHovered: {
    backgroundColor: '#FFDFDF',
    shadowOpacity: 0.4,
  },
  cardContent: {
    flexDirection: 'row', // Define a orientação da imagem e texto
    alignItems: 'center', // Alinha verticalmente o conteúdo
    height: 100, // Altura do card
  },
  cardImage: {
    width: 150, // Ajusta o tamanho da imagem
    height: 100,
    borderRadius: 8,
    marginRight: 16, // Espaço entre a imagem e o texto
  },
  noImageText: {
    fontSize: 12,
    color: '#888',
    marginRight: 16,
  },
  textContainer: {
    flex: 1, // Faz o texto ocupar o espaço restante
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: '#888',
  },
});

export default ReceitaItem;
