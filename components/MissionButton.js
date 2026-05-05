import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MissionButton() {
  return (
    <TouchableOpacity style={styles.button}>
      <Text style={styles.text}>Missão Diária</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8BC34A',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
});