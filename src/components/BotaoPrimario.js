import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTemaVisual } from "../context/TemaVisualContext";
import { raio, tipografia } from "../constants/layout";

export default function BotaoPrimario({ tituloBotao, onPress, desabilitado = false, variante = "primario" }) {
  const { paleta } = useTemaVisual();
  const eSecundario = variante === "secundario";

  if (eSecundario) {
    return (
      <TouchableOpacity
        style={[styles.botaoBorda, { borderColor: paleta.destaque }, desabilitado && styles.botaoDesabilitado]}
        onPress={onPress}
        disabled={desabilitado}
        activeOpacity={0.8}
      >
        <Text style={[styles.textoBorda, { color: paleta.destaque }]}>{tituloBotao}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={desabilitado}
      activeOpacity={0.85}
      style={[styles.botao, { backgroundColor: paleta.destaque }, desabilitado && styles.botaoDesabilitado]}
    >
      <Text style={styles.textoBotao}>{tituloBotao}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    borderRadius: raio.botao,
    paddingVertical: 13,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  botaoBorda: {
    borderRadius: raio.botao,
    borderWidth: 2,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 5,
    backgroundColor: "transparent",
  },
  botaoDesabilitado: { opacity: 0.45 },
  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: tipografia.corpo,
    letterSpacing: 0.5,
  },
  textoBorda: {
    fontWeight: "800",
    fontSize: tipografia.corpo,
  },
});
