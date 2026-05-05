import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import rotas from "../constants/rotas";
import { useTemaVisual } from "../context/TemaVisualContext";
import TextoApp from "../components/TextoApp";

const listaMiniGames = [
  { idGame: rotas.jogoMemoria, tituloGame: "Jogo da Memoria" },
  { idGame: rotas.jogoSnake, tituloGame: "Snake" },
  { idGame: rotas.jogoQuiz, tituloGame: "Quiz Rapido" },
  { idGame: rotas.jogoTap, tituloGame: "Tap Challenge" },
  { idGame: rotas.jogoNonogram, tituloGame: "Nonogram" },
];

export default function TelaMiniGames({ navigation }) {
  const { paleta, insetsChrome, tokens } = useTemaVisual();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{
        paddingTop: insetsChrome.paddingTopConteudo + tokens.espacamento.sm,
        paddingBottom: insetsChrome.paddingBottomConteudo + tokens.espacamento.lg,
        paddingHorizontal: tokens.espacamento.md,
      }}
    >
      <TextoApp style={[styles.descricao, { color: paleta.textoSecundario }]}>Conclua missoes e ganhe XP bonus com mini games.</TextoApp>
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
          <TextoApp style={[styles.tituloGame, { color: paleta.textoPrincipal }]}>{gameAtual.tituloGame}</TextoApp>
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
