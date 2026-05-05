import React from "react";
import { View, StyleSheet } from "react-native";

/** Faixas horizontais solidas (estetica pixel) a partir das mesmas cores do gradiente. */
export default function FaixasDeCores({ cores, style }) {
  if (!cores?.length) return null;
  return (
    <View style={[styles.coluna, style]}>
      {cores.map((cor, i) => (
        <View key={i} style={[styles.faixa, { backgroundColor: cor }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  coluna: {
    flex: 1,
    flexDirection: "column",
  },
  faixa: {
    flex: 1,
  },
});
