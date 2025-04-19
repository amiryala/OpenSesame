import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { 
  Text, 
  FAB, 
  Searchbar, 
  List, 
  Divider,
  IconButton
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePasswords } from '../contexts/PasswordContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { passwords, loading } = usePasswords();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter passwords based on search query
  const filteredPasswords = passwords.filter(
    item => 
      (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.notes?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const renderPasswordItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PasswordDetail', { id: item.id })}
    >
      <List.Item
        title={item.title || 'Untitled'}
        description={item.username || 'No username'}
        left={props => <List.Icon {...props} icon="key" />}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <Divider />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search passwords..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <IconButton
          icon="logout"
          size={24}
          onPress={logout}
        />
      </View>

      {passwords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You haven't added any passwords yet.
          </Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first password.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPasswords}
          renderItem={renderPasswordItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={
            filteredPasswords.length === 0 ? styles.emptyList : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>
                Try a different search term
              </Text>
            </View>
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddPassword', {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4a148c',
  },
});

export default HomeScreen;