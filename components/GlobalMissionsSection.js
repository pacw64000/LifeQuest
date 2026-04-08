import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GlobalMissionsSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugar para Missões Globais</Text>
      {/* Add dynamic list or action button here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    color: '#fff',
  },
});