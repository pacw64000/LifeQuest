// App.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import ProfileHeader from './components/ProfileHeader';
import MissionButton from './components/MissionButton';
import RewardsButton from './components/RewardsButton';
import GlobalMissionsSection from './components/GlobalMissionsSection';
import NavBar from './components/NavBar';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <ProfileHeader />
        
        <View style={styles.middleSection}>
          <MissionButton />
          <RewardsButton />
        </View>

        <GlobalMissionsSection />
      </View>

      <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Ensures the entire screen is taken up
    backgroundColor: '#F5F5F5',
  },
  mainContent: {
    flex: 1, // Ensures that content above NavBar takes up all space available
    paddingBottom: 80,  // Adds space for the NavBar at the bottom
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 20, // Adds space between Profile and buttons
  },
});