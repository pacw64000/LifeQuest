import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import rotas from "../constants/rotas";
import { useTemaVisual } from "../context/TemaVisualContext";
import { espacamento } from "../constants/layout";

const listaMiniGames = [
  { idGame: rotas.jogoMemoria,   tituloGame: "Jogo da Memória",    descricao: "Encontre todos os pares" },
  { idGame: rotas.jogoSnake,     tituloGame: "Snake",              descricao: "Coma a comida sem bater" },
  { idGame: rotas.jogoQuiz,      tituloGame: "Quiz Rápido",        descricao: "Responda perguntas de produtividade" },
  { idGame: rotas.jogoTap,       tituloGame: "Tap Challenge",      descricao: "Toque o máximo em 10 segundos" },
  { idGame: rotas.nonogramHub,   tituloGame: "Nonogram",           descricao: "Crie puzzles a partir de fotos e jogue online" },
  { idGame: rotas.jogoDigitacao, tituloGame: "Digitação Rápida",   descricao: "Digite a palavra antes do tempo" },
  { idGame: rotas.jogoTermo,     tituloGame: "Termo",              descricao: "Adivinhe a palavra em 6 tentativas" },
  { idGame: rotas.jogoSequencia, tituloGame: "Sequência de Cores", descricao: "Repita a sequência que pisca" },
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
      <Text style={[styles.descricao, { color: paleta.textoSecundario }]}>
        Ganhe XP bonus completando mini games. Limite diário aplicado.
      </Text>
      {listaMiniGames.map((gameAtual) => (
        <TouchableOpacity
          key={gameAtual.idGame}
          style={[styles.itemGame, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}
          onPress={() => navigation.navigate(gameAtual.idGame)}
          activeOpacity={0.75}
        >
          <Text style={[styles.tituloGame, { color: paleta.textoPrincipal }]}>{gameAtual.tituloGame}</Text>
          <Text style={[styles.descricaoGame, { color: paleta.textoSecundario }]}>{gameAtual.descricao}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  descricao: { marginBottom: 14, fontSize: 14 },
  itemGame: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  tituloGame: { fontWeight: "700", fontSize: 16, marginBottom: 4 },
  descricaoGame: { fontSize: 13 },
});
