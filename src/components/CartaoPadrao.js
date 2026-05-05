import React from "react";
import { View, StyleSheet } from "react-native";
import { useTemaVisual } from "../context/TemaVisualContext";

export default function CartaoPadrao({ children }) {
  const { paleta, tokens } = useTemaVisual();
  const pixel = tokens.usarFaixasEmVezDeGradiente;

  return (
    <View
      style={[
        styles.cartao,
        {
          backgroundColor: paleta.fundoCartao,
          borderColor: paleta.bordaSuave,
          borderRadius: tokens.raio.cartao,
          borderWidth: pixel ? 2 : 1,
          shadowColor: pixel ? "transparent" : paleta.destaque,
          shadowOpacity: pixel ? 0 : 0.12,
          shadowRadius: pixel ? 0 : 10,
          elevation: pixel ? 0 : 3,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    padding: 16,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
  },
});
