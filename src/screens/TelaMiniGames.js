import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground } from "react-native";
import rotas from "../constants/rotas";
import coresTema from "../constants/cores";

const listaMiniGames = [
  { idGame: rotas.jogoMemoria, tituloGame: "Jogo da Memoria" },
  { idGame: rotas.jogoSnake, tituloGame: "Snake" },
  { idGame: rotas.jogoQuiz, tituloGame: "Quiz Rapido" },
  { idGame: rotas.jogoTap, tituloGame: "Tap Challenge" },
  { idGame: rotas.jogoNonogram, tituloGame: "Nonogram" },
];

export default function TelaMiniGames({ navigation }) {
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
      <Text style={styles.descricao}>Conclua missoes e ganhe XP bonus com mini games.</Text>
      {listaMiniGames.map((gameAtual) => (
        <TouchableOpacity key={gameAtual.idGame} style={styles.itemGame} onPress={() => navigation.navigate(gameAtual.idGame)}>
          <Text style={styles.tituloGame}>{gameAtual.tituloGame}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: coresTema.fundoPrimario, padding: 16 },
  descricao: { color: coresTema.textoSecundario, marginBottom: 12 },
  itemGame: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: coresTema.bordaSuave,
  },
  tituloGame: { color: coresTema.textoPrincipal, fontWeight: "700" },
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
