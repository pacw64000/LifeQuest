import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTemaVisual } from "../context/TemaVisualContext";
import TextoApp from "./TextoApp";

export default function BotaoPrimario({ tituloBotao, onPress, desabilitado = false, variante = "primario" }) {
  const { paleta, tokens } = useTemaVisual();
  const eSecundario = variante === "secundario";
  const r = tokens.raio.botao;
  const fs = tokens.tipografia.corpo;
  const wrapBase = [{ borderRadius: r, overflow: "hidden", marginVertical: 6 }];

  if (eSecundario) {
    return (
      <TouchableOpacity
        style={[styles.botaoBorda, { borderColor: paleta.destaque, borderRadius: r }, desabilitado && styles.botaoDesabilitado]}
        onPress={onPress}
        disabled={desabilitado}
        activeOpacity={0.85}
      >
        <TextoApp style={[styles.textoBorda, { color: paleta.destaque, fontSize: fs }]}>{tituloBotao}</TextoApp>
      </TouchableOpacity>
    );
  }

  if (tokens.usarFaixasEmVezDeGradiente) {
    return (
      <TouchableOpacity onPress={onPress} disabled={desabilitado} activeOpacity={0.9} style={[wrapBase, desabilitado && styles.botaoDesabilitado]}>
        <View
          style={[
            styles.solidoPixel,
            {
              backgroundColor: paleta.destaque,
              borderRadius: r,
              borderBottomWidth: 3,
              borderBottomColor: paleta.destaqueEscuro,
            },
          ]}
        >
          <TextoApp style={[styles.textoBotao, { fontSize: fs }]}>{tituloBotao}</TextoApp>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={desabilitado} activeOpacity={0.9} style={[wrapBase, desabilitado && styles.botaoDesabilitado]}>
      <LinearGradient
        colors={[paleta.destaque, paleta.destaqueEscuro]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradiente, { borderRadius: r }]}
      >
        <TextoApp style={[styles.textoBotao, { fontSize: fs }]}>{tituloBotao}</TextoApp>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradiente: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  solidoPixel: {
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoBorda: {
    borderWidth: 2,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 6,
    backgroundColor: "transparent",
  },
  textoBorda: {
    fontWeight: "700",
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  textoBotao: {
    color: "#0A1628",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
