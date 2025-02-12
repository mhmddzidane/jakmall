import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, SafeAreaView, StyleSheet} from 'react-native';
import CategoryItem from './components/CategoryItem';
import JokeModal from './components/JokeModal';

const API_BASE = 'https://v2.jokeapi.dev';

interface Jokes {
  [key: string]: string[];
}

interface LoadingJokes {
  [key: string]: boolean;
}

interface ExpandedItems {
  [key: string]: boolean;
}

const App: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({});
  const [jokes, setJokes] = useState<Jokes>({});
  const [loadingJokes, setLoadingJokes] = useState<LoadingJokes>({});
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedJoke, setSelectedJoke] = useState<string>('');

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

  const fetchJokes = async (category: string, addMore = false) => {
    setLoadingJokes(prev => ({...prev, [category]: true}));

    try {
      const response = await fetch(
        `${API_BASE}/joke/${category}?type=single&amount=2`,
      );
      const result = await response.json();

      if (response.ok) {
        const newJokes = result.jokes.map((j: {joke: string}) => j.joke);
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

  const moveToTop = (item: string) => {
    setCategories(prev => [item, ...prev.filter(i => i !== item)]);
  };

  const toggleExpand = (category: string) => {
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
