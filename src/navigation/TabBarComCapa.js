import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTemaVisual } from "../context/TemaVisualContext";

export default function TabBarComCapa(props) {
  const { preferencias, paleta } = useTemaVisual();
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

  return (
    <View style={styles.bordaArredondada}>
      {usaImagem ? (
        <ImageBackground
          source={{ uri: preferencias.uriImagemRodape }}
          style={[styles.fundo, { paddingBottom: Math.max(insets.bottom, 8) }]}
          resizeMode="cover"
        >
          {conteudo}
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={paleta.footerGradient}
          style={[styles.fundo, { paddingBottom: Math.max(insets.bottom, 8) }]}
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
  bordaArredondada: {
    overflow: "hidden",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  fundo: {
    paddingTop: 6,
  },
});
