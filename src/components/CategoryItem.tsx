import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface CategoryItemProps {
  item: string;
  index: number;
  expanded: boolean;
  jokes?: string[];
  loading: boolean;
  toggleExpand: (category: string) => void;
  moveToTop: (category: string) => void;
  fetchJokes: (category: string, addMore?: boolean) => void;
  showModal: (joke: string) => void;
  openModal: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  item,
  index,
  expanded,
  jokes,
  loading,
  toggleExpand,
  moveToTop,
  fetchJokes,
  showModal,
  openModal,
}) => (
  <View style={styles.itemContainer}>
    <TouchableOpacity style={styles.item} onPress={() => toggleExpand(item)}>
      <Text style={styles.number}>{index + 1}.</Text>
      <Text style={styles.text}>{item}</Text>
      <TouchableOpacity
        onPress={() => moveToTop(item)}
        style={[index === 0 ? styles.topButton : styles.goTopButton]}>
        <Text style={styles.buttonText}>{index === 0 ? 'Top' : 'Go Top'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>

    {expanded && (
      <View style={styles.expandedContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#007bff" />
        ) : (
          <>
            {jokes && jokes.length > 0 ? (
              jokes.map((joke, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    showModal(joke);
                    openModal();
                  }}>
                  <Text style={styles.expandedText}>{joke}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text>No Data</Text>
            )}

            {jokes && jokes.length < 6 && (
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => fetchJokes(item, true)}>
                <Text style={styles.addMoreText}>Add More +</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    )}
  </View>
);

export default CategoryItem;

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2642CA',
    padding: 15,
    borderRadius: 5,
  },
  number: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  topButton: {
    backgroundColor: '#FFAA46',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  goTopButton: {
    backgroundColor: '#6AD2FF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  expandedContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 5,
    borderRadius: 5,
    elevation: 2,
  },
  expandedText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  addMoreButton: {
    backgroundColor: '#FFAA46',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addMoreText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
