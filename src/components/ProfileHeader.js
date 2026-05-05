import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';  // Import Progress.Bar

export default function ProfileHeader() {
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'profile_pic_url' }} style={styles.profilePic} />
      <Text style={styles.level}>Lv.99</Text>
      <Progress.Bar progress={0.99} width={300} style={styles.progressBar} />
      <Text style={styles.xp}>9998/9999 XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4A90E2',
    padding: 16,
    alignItems: 'center',
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  level: {
    fontSize: 18,
    color: '#fff',
    marginTop: 8,
  },
  progressBar: {
    marginTop: 8,
  },
  xp: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
});