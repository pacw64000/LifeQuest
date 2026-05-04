import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import CartaoPadrao from "../components/CartaoPadrao";
import { espacamento, raio, tipografia } from "../constants/layout";

export default function TelaDashboard() {
  const { usuarioAutenticado } = useAuth();
  const { expAtual, streakAtual, progressoNivel, xpMiniGamesHoje, limiteXpMiniGameDiario } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  const nome = usuarioAutenticado?.nomeUsuario || "Aventureiro";

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insetsChrome.paddingTopConteudo + espacamento.sm,
          paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.lg,
        },
      ]}
    >
      <LinearGradient colors={paleta.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={[styles.heroTitulo, { color: paleta.textoSobreGradiente }]}>Bem-vindo de volta</Text>
        <Text style={[styles.heroNome, { color: paleta.destaqueSecundario }]}>{nome}</Text>
        <Text style={[styles.heroSub, { color: paleta.textoSobreGradiente }]}>
          Pronto para mais uma aventura?
        </Text>
      </LinearGradient>

      <Text style={[styles.secaoTitulo, { color: paleta.textoPrincipal }]}>Seu progresso</Text>

      <CartaoPadrao>
        <View style={styles.linhaCartaoTopo}>
          <Ionicons name="trending-up" size={22} color={paleta.destaque} />
          <Text style={[styles.cartaoTitulo, { color: paleta.textoPrincipal }]}>Nivel {progressoNivel.nivelAtual}</Text>
        </View>
        <Text style={[styles.textoInfo, { color: paleta.textoSecundario }]}>
          XP: {expAtual} / {progressoNivel.expMaximo}
        </Text>
        <View style={[styles.barraFundo, { backgroundColor: paleta.fundoProfundo || "#0A1020" }]}>
          <LinearGradient
            colors={[paleta.destaque, paleta.destaqueEscuro]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.barraValor, { width: `${progressoNivel.progressoNivel}%` }]}
          />
        </View>
      </CartaoPadrao>

      <View style={styles.gridDois}>
        <View style={[styles.miniCartao, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}>
          <Ionicons name="flame" size={24} color={paleta.destaqueSecundario} />
          <Text style={[styles.miniValor, { color: paleta.textoPrincipal }]}>{streakAtual}</Text>
          <Text style={[styles.miniLabel, { color: paleta.textoSecundario }]}>Streak</Text>
        </View>
        <View style={[styles.miniCartao, { backgroundColor: paleta.fundoCartao, borderColor: paleta.bordaSuave }]}>
          <Ionicons name="game-controller" size={24} color={paleta.destaque} />
          <Text style={[styles.miniValor, { color: paleta.textoPrincipal }]}>
            {xpMiniGamesHoje}/{limiteXpMiniGameDiario}
          </Text>
          <Text style={[styles.miniLabel, { color: paleta.textoSecundario }]}>XP games hoje</Text>
        </View>
      </View>

      <CartaoPadrao>
        <View style={styles.linhaCartaoTopo}>
          <Ionicons name="compass-outline" size={22} color={paleta.destaqueSecundario} />
          <Text style={[styles.cartaoTitulo, { color: paleta.textoPrincipal }]}>Dica</Text>
        </View>
        <Text style={[styles.textoInfo, { color: paleta.textoSecundario }]}>
          Veja missoes na aba Missoes e personalize o tema em Perfil → Aparência.
        </Text>
      </CartaoPadrao>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingHorizontal: espacamento.md, flexGrow: 1 },
  hero: {
    borderRadius: raio.cartao,
    paddingVertical: espacamento.xl,
    paddingHorizontal: espacamento.lg,
    marginBottom: espacamento.lg,
    alignItems: "center",
  },
  heroTitulo: { fontSize: tipografia.legenda, fontWeight: "600", letterSpacing: 0.5, opacity: 0.95 },
  heroNome: { fontSize: 28, fontWeight: "900", marginTop: 6, marginBottom: 4 },
  heroSub: { fontSize: tipografia.corpo, opacity: 0.92, textAlign: "center" },
  secaoTitulo: { fontSize: tipografia.tituloSecao, fontWeight: "800", marginBottom: espacamento.sm },
  linhaCartaoTopo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  cartaoTitulo: { fontWeight: "700", fontSize: 16 },
  textoInfo: { fontSize: tipografia.corpo, lineHeight: 22 },
  barraFundo: { height: 10, borderRadius: 999, marginTop: 12, overflow: "hidden" },
  barraValor: { height: "100%", borderRadius: 999 },
  gridDois: { flexDirection: "row", gap: espacamento.sm, marginBottom: 14 },
  miniCartao: {
    flex: 1,
    borderRadius: raio.cartao,
    borderWidth: 1,
    padding: espacamento.md,
    alignItems: "center",
  },
  miniValor: { fontSize: 22, fontWeight: "800", marginTop: 6 },
  miniLabel: { fontSize: 12, marginTop: 2, fontWeight: "600" },
});
