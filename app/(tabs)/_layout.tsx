import { Tabs } from 'expo-router';
import React from 'react';

/**
 * BOTTOM NAVIGATION LAYOUT
 * This file automatically generates the bottom tab bar for the app.
 * Expo Router looks at the 'name' prop and links it to the matching filename in this directory.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Hide the defualt header so we can make our own.
        headerShown: false,
      }}>
      
      {/* Maps to app/(tabs)/index.tsx */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      
      {/* Maps to app/(tabs)/explore.tsx */}
      <Tabs.Screen
        name="explore"
        options={{
          // Shows payment history. We might reorganize this later.
          title: 'Explore', 
        }}
      />
    </Tabs>
  );
}