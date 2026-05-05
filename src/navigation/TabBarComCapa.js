import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTemaVisual } from "../context/TemaVisualContext";
import FaixasDeCores from "../components/FaixasDeCores";

export default function TabBarComCapa(props) {
  const { preferencias, paleta, tokens } = useTemaVisual();
  const insets = useSafeAreaInsets();
  const usaImagem = preferencias.modoRodape === "imagem" && preferencias.uriImagemRodape;

  const estiloTabBarTransparente = [
    props.style,
    {
      backgroundColor: "transparent",
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
  ];

  const conteudo = <BottomTabBar {...props} style={estiloTabBarTransparente} />;

  const capaExterna = [
    styles.capaBase,
    {
      borderTopLeftRadius: tokens.tabBarTopRadius,
      borderTopRightRadius: tokens.tabBarTopRadius,
      borderTopWidth: tokens.tabBarBorderTop,
      borderTopColor: paleta.bordaSuave,
    },
  ];

  const paddingRodape = { paddingBottom: Math.max(insets.bottom, 8) };

  return (
    <View style={capaExterna}>
      {usaImagem ? (
        <ImageBackground
          source={{ uri: preferencias.uriImagemRodape }}
          style={[styles.fundo, paddingRodape]}
          resizeMode="cover"
        >
          {conteudo}
        </ImageBackground>
      ) : tokens.usarFaixasEmVezDeGradiente ? (
        <View style={[styles.fundo, paddingRodape, styles.fundoFaixas]}>
          <FaixasDeCores cores={paleta.footerGradient} style={StyleSheet.absoluteFillObject} />
          {conteudo}
        </View>
      ) : (
        <LinearGradient
          colors={paleta.footerGradient}
          style={[styles.fundo, paddingRodape]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {conteudo}
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  capaBase: {
    overflow: "hidden",
  },
  fundoFaixas: {
    position: "relative",
  },
  fundo: {
    paddingTop: 6,
  },
});
