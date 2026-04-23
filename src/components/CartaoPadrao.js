import React from "react";
import { View, StyleSheet } from "react-native";
import coresTema from "../constants/cores";

export default function CartaoPadrao({ children }) {
  return <View style={styles.cartao}>{children}</View>;
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: coresTema.fundoCartao,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: coresTema.bordaSuave,
  },
});
