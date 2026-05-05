import React from "react";
import { View, StyleSheet } from "react-native";
import { useTemaVisual } from "../context/TemaVisualContext";
import { raio } from "../constants/layout";

export default function CartaoPadrao({ children, style }) {
  const { paleta } = useTemaVisual();

  return (
    <View
      style={[
        styles.cartao,
        {
          backgroundColor: paleta.fundoCartao,
          borderColor: paleta.bordaSuave,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: raio.cartao,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
  },
});
