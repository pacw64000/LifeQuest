import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import coresTema from "../constants/cores";

export default function BotaoPrimario({ tituloBotao, onPress, desabilitado = false }) {
  return (
    <TouchableOpacity
      style={[styles.botao, desabilitado && styles.botaoDesabilitado]}
      onPress={onPress}
      disabled={desabilitado}
    >
      <Text style={styles.textoBotao}>{tituloBotao}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: coresTema.destaque,
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
