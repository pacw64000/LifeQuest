import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTemaVisual } from "../context/TemaVisualContext";

export default function BotaoPrimario({ tituloBotao, onPress, desabilitado = false, variante = "primario" }) {
  const { paleta } = useTemaVisual();
  const eSecundario = variante === "secundario";

  if (eSecundario) {
    return (
      <TouchableOpacity
        style={[styles.botaoBorda, { borderColor: paleta.destaque }, desabilitado && styles.botaoDesabilitado]}
        onPress={onPress}
        disabled={desabilitado}
        activeOpacity={0.85}
      >
        <Text style={[styles.textoBorda, { color: paleta.destaque }]}>{tituloBotao}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={desabilitado} activeOpacity={0.9} style={[styles.wrap, desabilitado && styles.botaoDesabilitado]}>
      <LinearGradient
        colors={[paleta.destaque, paleta.destaqueEscuro]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradiente}
      >
        <Text style={styles.textoBotao}>{tituloBotao}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 6,
  },
  gradiente: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoBorda: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 6,
    backgroundColor: "transparent",
  },
  textoBorda: {
    fontWeight: "700",
    fontSize: 15,
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  textoBotao: {
    color: "#0A1628",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
