import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * ACTIVITY / HISTORY TAB
 * Currently a static UI placeholder for the Proof of Concept.
 */
export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Your recent transactions will appear here.</Text>
      </View>
      
      {/* Empty State UI 
        Displayed when the user has 0 transactions in their history.
      */}
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No recent activity.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#fff', 
    letterSpacing: -1 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 8 
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Pushed up slightly from the exact vertical center
  },
  emptyText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  }
});