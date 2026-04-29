import React, { Component } from "react";
import { ScrollView, StyleSheet, Text, View, ImageBackground } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useDadosApp } from "../context/DadosAppContext";
import CartaoPadrao from "../components/CartaoPadrao";
import BotaoPrimario from "../components/BotaoPrimario";
import coresTema from "../constants/cores";

function Untitled(props) {
  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.rect}
        imageStyle={styles.rect_imageStyle}
        source={require("../assets/images/Gradient_JV33GZG.png")}
      ></ImageBackground>
      <ImageBackground
        style={styles.rect2}
        imageStyle={styles.rect2_imageStyle}
        source={require("../assets/images/Gradient_H0Vzu6n.png")}
      ></ImageBackground>
    </View>
  );
}

export default function TelaDashboard() {
  const { usuarioAutenticado, logout } = useAuth();
  const { expAtual, streakAtual, progressoNivel, xpMiniGamesHoje, limiteXpMiniGameDiario } = useDadosApp();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Dashboard</Text>
      <Text style={styles.subtitulo}>Ola, {usuarioAutenticado?.nomeUsuario || "Aventureiro"}</Text>

      <CartaoPadrao>
        <Text style={styles.cartaoTitulo}>Nivel {progressoNivel.nivelAtual}</Text>
        <Text style={styles.textoInfo}>
          XP: {expAtual} / {progressoNivel.expMaximo}
        </Text>
        <View style={styles.barraFundo}>
          <View style={[styles.barraValor, { width: `${progressoNivel.progressoNivel}%` }]} />
        </View>
      </CartaoPadrao>

      <CartaoPadrao>
        <Text style={styles.cartaoTitulo}>Streak</Text>
        <Text style={styles.textoInfo}>{streakAtual} dias consecutivos</Text>
      </CartaoPadrao>

      <CartaoPadrao>
        <Text style={styles.cartaoTitulo}>XP de mini games hoje</Text>
        <Text style={styles.textoInfo}>
          {xpMiniGamesHoje} / {limiteXpMiniGameDiario}
        </Text>
      </CartaoPadrao>

      <BotaoPrimario tituloBotao="Sair da conta" onPress={logout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: coresTema.fundoPrimario, flexGrow: 1 },
  titulo: { fontSize: 28, fontWeight: "800", color: coresTema.textoPrincipal },
  subtitulo: { color: coresTema.textoSecundario, marginBottom: 14 },
  cartaoTitulo: { fontWeight: "700", fontSize: 16, marginBottom: 6, color: coresTema.textoPrincipal },
  textoInfo: { color: coresTema.textoSecundario },
  barraFundo: { backgroundColor: "#E8EAF4", height: 10, borderRadius: 999, marginTop: 10, overflow: "hidden" },
  barraValor: { backgroundColor: coresTema.destaque, height: "100%" },
  rect: {
    width: 375,
    height: 119
  },
  rect_imageStyle: {},
  rect2: {
    width: 375,
    height: 100,
    marginTop: 593
  },
  rect2_imageStyle: {}
});
