import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

const imagemTopo = require("../../assets/images/Gradient_JV33GZG.png");
const imagemBase = require("../../assets/images/Gradient_H0Vzu6n.png");

/**
 * Camada decorativa (gradientes exportados do design) sem ocupar fluxo do layout
 * nem interceptar toques. Os assets ficam na raiz do projeto em assets/images.
 */
export default function FundoGradienteDecorativo({ children, style }) {
  return (
    <View style={[styles.raiz, style]}>
      <View style={styles.camadaAbsoluta} pointerEvents="none">
        <ImageBackground source={imagemTopo} style={styles.faixaTopo} imageStyle={styles.imagemCobre} resizeMode="cover">
          <View style={styles.preenchimentoTransparente} />
        </ImageBackground>
        <ImageBackground source={imagemBase} style={styles.faixaBase} imageStyle={styles.imagemCobre} resizeMode="cover">
          <View style={styles.preenchimentoTransparente} />
        </ImageBackground>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  camadaAbsoluta: {
    ...StyleSheet.absoluteFillObject,
  },
  imagemCobre: {
    width: "100%",
    height: "100%",
  },
  preenchimentoTransparente: {
    flex: 1,
    backgroundColor: "transparent",
  },
  faixaTopo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  faixaBase: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
});
