import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import rotas from "../constants/rotas";
import { useTemaVisual } from "../context/TemaVisualContext";
import TextoApp from "../components/TextoApp";

const listaMiniGames = [
  { idGame: rotas.jogoMemoria,   tituloGame: "Jogo da Memória",    descricao: "Encontre todos os pares" },
  { idGame: rotas.jogoSnake,     tituloGame: "Snake",              descricao: "Coma a comida sem bater" },
  { idGame: rotas.jogoQuiz,      tituloGame: "Quiz Rápido",        descricao: "Escolha a categoria, responda contra o tempo e veja o ranking" },
  { idGame: rotas.jogoTap,       tituloGame: "Tap Challenge",      descricao: "Toque o máximo em 10 segundos" },
  { idGame: rotas.nonogramHub,   tituloGame: "Nonogram",           descricao: "Crie puzzles a partir de fotos e jogue online" },
  { idGame: rotas.jogoDigitacao, tituloGame: "Digitação Rápida",   descricao: "Digite a palavra antes do tempo" },
  { idGame: rotas.jogoTermo,     tituloGame: "Termo",              descricao: "Adivinhe a palavra em 6 tentativas" },
  { idGame: rotas.jogoSequencia, tituloGame: "Sequência de Cores", descricao: "Repita a sequência que pisca" },
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
      <TextoApp style={[styles.descricao, { color: paleta.textoSecundario }]}>
        Ganhe XP bonus completando mini games. Limite diário aplicado.
      </TextoApp>
      {listaMiniGames.map((gameAtual) => (
        <TouchableOpacity
          key={gameAtual.idGame}
          style={[styles.itemGame, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}
          onPress={() => navigation.navigate(gameAtual.idGame)}
          activeOpacity={0.75}
        >
          <TextoApp style={[styles.tituloGame, { color: paleta.textoPrincipal }]}>{gameAtual.tituloGame}</TextoApp>
          <TextoApp style={[styles.descricaoGame, { color: paleta.textoSecundario }]}>{gameAtual.descricao}</TextoApp>
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