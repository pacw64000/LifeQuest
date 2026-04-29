import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTemaVisual } from "../context/TemaVisualContext";

export default function BotaoPrimario({ tituloBotao, onPress, desabilitado = false }) {
  const { paleta } = useTemaVisual();

  return (
    <TouchableOpacity
      style={[
        styles.botao,
        { backgroundColor: paleta.destaque },
        desabilitado && styles.botaoDesabilitado,
      ]}
      onPress={onPress}
      disabled={desabilitado}
    >
      <Text style={styles.textoBotao}>{tituloBotao}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 6,
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  textoBotao: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
