import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import rotas from "../constants/rotas";
import { useTemaVisual } from "../context/TemaVisualContext";
import { espacamento } from "../constants/layout";

const listaMiniGames = [
  { idGame: rotas.jogoMemoria, tituloGame: "Jogo da Memoria" },
  { idGame: rotas.jogoSnake, tituloGame: "Snake" },
  { idGame: rotas.jogoQuiz, tituloGame: "Quiz Rapido" },
  { idGame: rotas.jogoTap, tituloGame: "Tap Challenge" },
  { idGame: rotas.jogoNonogram, tituloGame: "Nonogram" },
];

export default function TelaMiniGames({ navigation }) {
  const { paleta, insetsChrome } = useTemaVisual();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + espacamento.sm,
        paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.lg,
        paddingHorizontal: espacamento.md,
      }}
    >
      <Text style={[styles.descricao, { color: paleta.textoSecundario }]}>Conclua missoes e ganhe XP bonus com mini games.</Text>
      {listaMiniGames.map((gameAtual) => (
        <TouchableOpacity
          key={gameAtual.idGame}
          style={[
            styles.itemGame,
            {
              backgroundColor: paleta.fundoCartao,
              borderColor: paleta.bordaSuave,
            },
          ]}
          onPress={() => navigation.navigate(gameAtual.idGame)}
        >
          <Text style={[styles.tituloGame, { color: paleta.textoPrincipal }]}>{gameAtual.tituloGame}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  descricao: { marginBottom: 12 },
  itemGame: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  tituloGame: { fontWeight: "700" },
});
