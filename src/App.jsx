import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, SafeAreaView, StyleSheet} from 'react-native';
import CategoryItem from './components/CategoryItem';
import JokeModal from './components/JokeModal';

const API_BASE = 'https://v2.jokeapi.dev';

const App = () => {
  const [categories, setCategories] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [jokes, setJokes] = useState({});
  const [loadingJokes, setLoadingJokes] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJoke, setSelectedJoke] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const result = await response.json();
      setCategories(result.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJokes = async (category, addMore = false) => {
    setLoadingJokes(prev => ({...prev, [category]: true}));

    try {
      const response = await fetch(
        `${API_BASE}/joke/${category}?type=single&amount=2`,
      );
      const result = await response.json();

      if (response.ok) {
        const newJokes = result.jokes.map(j => j.joke);
        setJokes(prev => ({
          ...prev,
          [category]: addMore
            ? [...(prev[category] || []), ...newJokes]
            : newJokes,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJokes(prev => ({...prev, [category]: false}));
    }
  };

  const moveToTop = item => {
    setCategories(prev => [item, ...prev.filter(i => i !== item)]);
  };

  const toggleExpand = category => {
    setExpandedItems(prev => ({...prev, [category]: !prev[category]}));
    if (!jokes[category]) fetchJokes(category);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setJokes({});
    setExpandedItems({});
    setLoadingJokes({});
    await fetchCategories();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item, index}) => (
          <CategoryItem
            item={item}
            index={index}
            expanded={expandedItems[item]}
            jokes={jokes[item]}
            loading={loadingJokes[item]}
            toggleExpand={toggleExpand}
            moveToTop={moveToTop}
            fetchJokes={fetchJokes}
            showModal={setSelectedJoke}
            openModal={() => setModalVisible(true)}
          />
        )}
      />

      <JokeModal
        visible={modalVisible}
        joke={selectedJoke}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
});

export default App;
