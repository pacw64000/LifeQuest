import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import rotas from "../constants/rotas";
import coresTema from "../constants/cores";
import FundoGradienteDecorativo from "../components/FundoGradienteDecorativo";

const listaMiniGames = [
  { idGame: rotas.jogoMemoria, tituloGame: "Jogo da Memoria" },
  { idGame: rotas.jogoSnake, tituloGame: "Snake" },
  { idGame: rotas.jogoQuiz, tituloGame: "Quiz Rapido" },
  { idGame: rotas.jogoTap, tituloGame: "Tap Challenge" },
  { idGame: rotas.jogoNonogram, tituloGame: "Nonogram" },
];

export default function TelaMiniGames({ navigation }) {
  return (
    <FundoGradienteDecorativo style={styles.container}>
      <Text style={styles.descricao}>Conclua missoes e ganhe XP bonus com mini games.</Text>
      {listaMiniGames.map((gameAtual) => (
        <TouchableOpacity key={gameAtual.idGame} style={styles.itemGame} onPress={() => navigation.navigate(gameAtual.idGame)}>
          <Text style={styles.tituloGame}>{gameAtual.tituloGame}</Text>
        </TouchableOpacity>
      ))}
    </FundoGradienteDecorativo>
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
});
