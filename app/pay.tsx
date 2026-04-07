import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';
import { web3auth } from './_layout';

// Data model mapped to our Firestore 'users' collection
interface User {
  name: string;
  email: string;
  walletAddress: string;
  profileImage?: string;
}

/**
 * PEER-TO-PEER PAYMENT SCREEN
 * Handles querying the Firebase social graph to find other users,
 * and presents the UI to input a USDC transfer amount.
 */
export default function PayScreen() {
  const router = useRouter();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile & Payment State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [transferAmount, setTransferAmount] = useState('');

  /**
   * Initial Data Load
   * Fetches all users from Firebase and immediately filters out the current user
   * so they cannot send money to themselves.
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 1. Identify who is holding the phone
        let currentUserAddress = "";
        if (web3auth.provider) {
          const accounts = await web3auth.provider.request({ method: 'requestAccounts' });
          if (Array.isArray(accounts) && accounts.length > 0 && typeof accounts[0] === 'string') {
            currentUserAddress = accounts[0];
          }
        }

        // 2. Fetch the entire social graph
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: User[] = [];
        
        querySnapshot.forEach((doc) => {
          const userData = doc.data() as User;
          // 3. Prevent self-payment by excluding the current address
          if (userData.walletAddress !== currentUserAddress) {
            usersList.push(userData);
          }
        });
        
        setAllUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Client-Side Search Filter
   */
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = allUsers.filter(user => 
        (user.name && user.name.toLowerCase().includes(lowerCaseQuery)) || 
        (user.walletAddress && user.walletAddress.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  // UI Component for rendering individual rows in the search list
  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userCard} 
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.name ? item.name.charAt(0).toUpperCase() : '?'}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || 'Unknown User'}</Text>
        <Text style={styles.userWallet}>
          {item.walletAddress.substring(0, 4)}...{item.walletAddress.substring(item.walletAddress.length - 4)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Funds</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Conditionally render the Payment Form OR the Search List */}
      {selectedUser ? (
        <View style={styles.profileSection}>
          <View style={styles.largeAvatar}>
             <Text style={styles.largeAvatarText}>{selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : '?'}</Text>
          </View>
          <Text style={styles.profileName}>{selectedUser.name}</Text>
          <Text style={styles.profileWallet}>{selectedUser.walletAddress}</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={transferAmount}
              onChangeText={setTransferAmount}
              autoFocus={true}
            />
            <Text style={styles.currencyLabel}>USDC</Text>
          </View>

          <TouchableOpacity 
            style={styles.sendButton}
            onPress={() => {
              // TODO: Phase 2. Implement the @solana/web3.js transfer logic here.
              // We need to build the transaction, sign it with web3auth.provider, and send it to the RPC.
              console.log(`Simulating sending ${transferAmount} USDC to ${selectedUser.walletAddress}`)
            }}
          >
            <Text style={styles.sendButtonText}>Send Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setSelectedUser(null)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or wallet..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item, index) => item.walletAddress || index.toString()}
              renderItem={renderUserItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No users found.</Text>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 60, 
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderColor: '#333'
  },
  backButton: { padding: 10, marginLeft: -10 },
  backText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  // Search UI
  searchSection: { flex: 1, padding: 20 },
  searchInput: {
    backgroundColor: '#161616',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  userWallet: { color: '#888', fontSize: 13, marginTop: 4 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },

  // Profile UI
  profileSection: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 40 },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  largeAvatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  profileName: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 5 },
  profileWallet: { color: '#888', fontSize: 14, marginBottom: 40 },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40
  },
  currencySymbol: { color: '#fff', fontSize: 40, fontWeight: '800', marginRight: 10 },
  amountInput: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '900',
    minWidth: 100,
    textAlign: 'center'
  },
  currencyLabel: { color: '#4ADE80', fontSize: 20, fontWeight: '700', marginLeft: 10, alignSelf: 'flex-end', paddingBottom: 10 },
  sendButton: {
    backgroundColor: '#007AFF',
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15
  },
  sendButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cancelButton: { padding: 15 },
  cancelButtonText: { color: '#888', fontSize: 16, fontWeight: '600' }
});