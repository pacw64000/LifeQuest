import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import rotas from "../constants/rotas";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import { espacamento, raio, tipografia } from "../constants/layout";

const JOGOS = [
  {
    id: rotas.jogoMemoria,
    nome: "MEMÓRIA",
    descricao: "Encontre os pares",
    xpInfo: "$20-50 XP",
    cor: "#7B5EA7",
    icone: "🧩",
  },
  {
    id: rotas.jogoSnake,
    nome: "SNAKE",
    descricao: "Cresça sem bater",
    xpInfo: "$5/maçã XP",
    cor: "#2D8B4E",
    icone: "🐍",
  },
  {
    id: rotas.jogoQuiz,
    nome: "QUIZ",
    descricao: "5 perguntas rápidas",
    xpInfo: "$até 55 XP",
    cor: "#4A7BC4",
    icone: "❓",
  },
  {
    id: rotas.jogoTap,
    nome: "TAP CHALLENGE",
    descricao: "Clique em 5s",
    xpInfo: "$até 50 XP",
    cor: "#C8A020",
    icone: "⚡",
  },
];

export default function TelaMiniGames({ navigation }) {
  const { partidasRestantesHoje, limiteXpMiniGameDiario, xpMiniGamesHoje } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{ paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.xl }}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: paleta.destaque, paddingTop: insetsChrome.paddingTopConteudo }]}>
        <Text style={styles.headerTitulo}>ARCADE</Text>
        <Text style={styles.headerSub}>Use seu tempo livre pra ganhar XP extra</Text>
      </View>

      <View style={styles.corpo}>
        {/* Banner limite diário */}
        <View style={[styles.limiteBanner, { backgroundColor: paleta.destaqueSecundario, borderColor: paleta.bordaSuave }]}>
          <Ionicons name="shield-checkmark" size={18} color="#1A0A04" />
          <View style={{ flex: 1 }}>
            <Text style={styles.limiteLabel}>LIMITE DIÁRIO</Text>
            <Text style={styles.limiteInfo}>
              {partidasRestantesHoje} partidas restantes hoje · {xpMiniGamesHoje}/{limiteXpMiniGameDiario} XP usados
            </Text>
          </View>
        </View>

        {/* Grade 2×2 */}
        <View style={styles.grade}>
          {JOGOS.map((jogo) => (
            <TouchableOpacity
              key={jogo.id}
              style={[styles.jogoCard, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}
              onPress={() => navigation.navigate(jogo.id)}
              activeOpacity={0.8}
            >
              {/* Ícone colorido */}
              <View style={[styles.jogoIconeBox, { backgroundColor: jogo.cor }]}>
                <Text style={styles.jogoIcone}>{jogo.icone}</Text>
              </View>
              <Text style={[styles.jogoNome, { color: paleta.textoPrincipal }]}>{jogo.nome}</Text>
              <Text style={[styles.jogoDesc, { color: paleta.textoSecundario }]}>{jogo.descricao}</Text>
              <Text style={[styles.jogoXp, { color: paleta.sucesso }]}>{jogo.xpInfo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },

  header: {
    paddingHorizontal: espacamento.md,
    paddingBottom: espacamento.md,
  },
  headerTitulo: { color: "#FFF", fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },

  corpo: { paddingHorizontal: espacamento.md, paddingTop: espacamento.md },

  limiteBanner: {
    flexDirection: "row", alignItems: "center", gap: espacamento.sm,
    borderRadius: raio.cartao, borderWidth: 2, padding: espacamento.md,
    marginBottom: espacamento.md,
  },
  limiteLabel: { fontSize: 12, fontWeight: "900", color: "#1A0A04", letterSpacing: 0.3 },
  limiteInfo: { fontSize: 12, color: "#3A2A10", marginTop: 2 },

  grade: { flexDirection: "row", flexWrap: "wrap", gap: espacamento.sm },

  jogoCard: {
    width: "48.5%",
    borderRadius: raio.cartao,
    borderWidth: 2,
    padding: espacamento.md,
    alignItems: "flex-start",
    marginBottom: 2,
  },
  jogoIconeBox: {
    width: 48, height: 48, borderRadius: raio.cartao,
    alignItems: "center", justifyContent: "center",
    marginBottom: espacamento.sm,
  },
  jogoIcone: { fontSize: 26 },
  jogoNome: { fontSize: tipografia.corpo, fontWeight: "900", letterSpacing: 0.3, marginBottom: 3 },
  jogoDesc: { fontSize: 12, marginBottom: 6 },
  jogoXp: { fontSize: 13, fontWeight: "800" },
});
