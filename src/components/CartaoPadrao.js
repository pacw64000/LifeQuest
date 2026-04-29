import React from "react";
import { View, StyleSheet } from "react-native";
import { useTemaVisual } from "../context/TemaVisualContext";

export default function CartaoPadrao({ children }) {
  const { paleta } = useTemaVisual();

  return (
    <View
      style={[
        styles.cartao,
        {
          backgroundColor: paleta.fundoCartao,
          borderColor: paleta.bordaSuave,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
});
