import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';

const App = () => {
  const [data, setData] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [jokes, setJokes] = useState({});
  const [loadingJokes, setLoadingJokes] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJoke, setSelectedJoke] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://v2.jokeapi.dev/categories');
      const result = await response.json();
      setData(result.categories);
    } catch (err) {
      console.error(err);
    }
  };

  // Pull to refresh (reset everything)
  const onRefresh = async () => {
    setRefreshing(true);
    setJokes({});
    setExpandedItems({});
    setLoadingJokes({});
    await fetchCategories();
    setRefreshing(false);
  };

  // Toggle expand/collapse without re-fetching jokes
  const toggleExpand = category => {
    setExpandedItems(prev => ({
      ...prev,
      [category]: !prev[category],
    }));

    if (!jokes[category]) {
      fetchJokes(category);
    }
  };

  // Fetch jokes (append if addMore is true)
  const fetchJokes = async (category, addMore = false) => {
    if (addMore || !jokes[category]) {
      setLoadingJokes(prev => ({...prev, [category]: true}));

      try {
        const response = await fetch(
          `https://v2.jokeapi.dev/joke/${category}?type=single&amount=2`,
        );
        const result = await response.json();

        const newJokes = result.jokes.map(j => j.joke);

        setJokes(prev => ({
          ...prev,
          [category]: addMore
            ? [...(prev[category] || []), ...newJokes]
            : newJokes,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJokes(prev => ({...prev, [category]: false}));
      }
    }
  };

  // Move item to top
  const moveToTop = item => {
    setData(prevData => [item, ...prevData.filter(i => i !== item)]);
  };

  // Show joke modal
  const showModal = joke => {
    setSelectedJoke(joke);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item, index}) => (
          <View style={styles.itemContainer}>
            {/* Main Category Button */}
            <TouchableOpacity
              style={styles.item}
              onPress={() => toggleExpand(item)}>
              <Text style={styles.number}>{index + 1}.</Text>
              <Text style={styles.text}>{item}</Text>
              <TouchableOpacity
                style={styles.goTopButton}
                onPress={() => moveToTop(item)}>
                <Text style={styles.buttonText}>Go Top ⬆️</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Expanded Content */}
            {expandedItems[item] && (
              <View style={styles.expandedContainer}>
                {loadingJokes[item] ? (
                  <ActivityIndicator size="small" color="#007bff" />
                ) : (
                  <>
                    {jokes[item]?.map((joke, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => showModal(joke)}>
                        <Text style={styles.expandedText}>{joke}</Text>
                      </TouchableOpacity>
                    ))}

                    {/* Add More Button */}
                    <TouchableOpacity
                      style={styles.addMoreButton}
                      onPress={() => fetchJokes(item, true)}>
                      <Text style={styles.addMoreText}>Add More ➕</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        )}
      />

      {/* Modal for Joke Display */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{selectedJoke}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  itemContainer: {
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
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
  goTopButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  addMoreButton: {
    backgroundColor: '#ff9800',
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App;
