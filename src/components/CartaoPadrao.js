import React from "react";
import { View, StyleSheet } from "react-native";
import { useTemaVisual } from "../context/TemaVisualContext";
import { raio } from "../constants/layout";

export default function CartaoPadrao({ children }) {
  const { paleta } = useTemaVisual();

  return (
    <View
      style={[
        styles.cartao,
        {
          backgroundColor: paleta.fundoCartao,
          borderColor: paleta.bordaSuave,
          shadowColor: paleta.destaque,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: raio.cartao,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
});
