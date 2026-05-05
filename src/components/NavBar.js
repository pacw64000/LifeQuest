// NavBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import icons from FontAwesome

export default function NavBar() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navButton}>
        <Icon name="flag" size={24} color="#4A90E2" />
        <Text style={styles.navButtonText}>Missions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton}>
        <Icon name="dashboard" size={24} color="#4A90E2" />
        <Text style={styles.navButtonText}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.centerButton}>
        <Icon name="plus" size={32} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton}>
        <Icon name="gamepad" size={24} color="#4A90E2" />
        <Text style={styles.navButtonText}>Games</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton}>
        <Icon name="plus" size={24} color="#4A90E2" />
        <Text style={styles.navButtonText}>loja</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    marginTop: 4,
  },
  centerButton: {
    backgroundColor: '#4A90E2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});