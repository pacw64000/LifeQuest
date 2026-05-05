import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import CartaoPadrao from "../components/CartaoPadrao";
import TextoApp from "../components/TextoApp";
import FaixasDeCores from "../components/FaixasDeCores";

function criarEstilos(tokens) {
  const { espacamento: e, tipografia: tip } = tokens;
  return StyleSheet.create({
    scroll: { flex: 1 },
    container: { paddingHorizontal: e.md, flexGrow: 1 },
    hero: {
      marginBottom: e.lg,
    },
    heroInner: {
      paddingVertical: e.xl,
      paddingHorizontal: e.lg,
      alignItems: "center",
    },
    heroTitulo: { fontSize: tip.legenda, fontWeight: "600", letterSpacing: 0.5, opacity: 0.95 },
    heroNome: { fontSize: 28, fontWeight: "900", marginTop: 6, marginBottom: 4 },
    heroSub: { fontSize: tip.corpo, opacity: 0.92, textAlign: "center" },
    secaoTitulo: { fontSize: tip.tituloSecao, fontWeight: "800", marginBottom: e.sm },
    linhaCartaoTopo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    cartaoTitulo: { fontWeight: "700", fontSize: 16 },
    textoInfo: { fontSize: tip.corpo, lineHeight: 22 },
    barraFundo: { height: 10, borderRadius: 999, marginTop: 12, overflow: "hidden" },
    barraValor: { height: "100%", borderRadius: 999 },
    gridDois: { flexDirection: "row", gap: e.sm, marginBottom: 14 },
    miniCartao: {
      flex: 1,
      padding: e.md,
      alignItems: "center",
    },
    miniValor: { fontSize: 22, fontWeight: "800", marginTop: 6 },
    miniLabel: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  });
}

export default function TelaDashboard() {
  const { usuarioAutenticado } = useAuth();
  const { expAtual, streakAtual, progressoNivel, xpMiniGamesHoje, limiteXpMiniGameDiario } = useDadosApp();
  const { paleta, insetsChrome, tokens } = useTemaVisual();
  const styles = useMemo(() => criarEstilos(tokens), [tokens]);

  const nome = usuarioAutenticado?.nomeUsuario || "Aventureiro";

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insetsChrome.paddingTopConteudo + tokens.espacamento.sm,
          paddingBottom: insetsChrome.paddingBottomConteudo + tokens.espacamento.lg,
        },
      ]}
    >
      <View style={[styles.hero, { borderRadius: tokens.raio.cartao, overflow: "hidden" }]}>
        {tokens.usarFaixasEmVezDeGradiente ? (
          <FaixasDeCores cores={paleta.headerGradient} style={StyleSheet.absoluteFillObject} />
        ) : (
          <LinearGradient colors={paleta.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
        )}
        <View style={styles.heroInner}>
          <TextoApp style={[styles.heroTitulo, { color: paleta.textoSobreGradiente }]}>Bem-vindo de volta</TextoApp>
          <TextoApp style={[styles.heroNome, { color: paleta.destaqueSecundario }]}>{nome}</TextoApp>
          <TextoApp style={[styles.heroSub, { color: paleta.textoSobreGradiente }]}>Pronto para mais uma aventura?</TextoApp>
        </View>
      </View>

      <TextoApp style={[styles.secaoTitulo, { color: paleta.textoPrincipal }]}>Seu progresso</TextoApp>

      <CartaoPadrao>
        <View style={styles.linhaCartaoTopo}>
          <Ionicons name="trending-up" size={22} color={paleta.destaque} />
          <TextoApp style={[styles.cartaoTitulo, { color: paleta.textoPrincipal }]}>Nivel {progressoNivel.nivelAtual}</TextoApp>
        </View>
        <TextoApp style={[styles.textoInfo, { color: paleta.textoSecundario }]}>
          XP: {expAtual} / {progressoNivel.expMaximo}
        </TextoApp>
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
        <View
          style={[
            styles.miniCartao,
            {
              backgroundColor: paleta.fundoCartao,
              borderColor: paleta.bordaSuave,
              borderRadius: tokens.raio.cartao,
              borderWidth: tokens.usarFaixasEmVezDeGradiente ? 2 : 1,
            },
          ]}
        >
          <Ionicons name="flame" size={24} color={paleta.destaqueSecundario} />
          <TextoApp style={[styles.miniValor, { color: paleta.textoPrincipal }]}>{streakAtual}</TextoApp>
          <TextoApp style={[styles.miniLabel, { color: paleta.textoSecundario }]}>Streak</TextoApp>
        </View>
        <View
          style={[
            styles.miniCartao,
            {
              backgroundColor: paleta.fundoCartao,
              borderColor: paleta.bordaSuave,
              borderRadius: tokens.raio.cartao,
              borderWidth: tokens.usarFaixasEmVezDeGradiente ? 2 : 1,
            },
          ]}
        >
          <Ionicons name="game-controller" size={24} color={paleta.destaque} />
          <TextoApp style={[styles.miniValor, { color: paleta.textoPrincipal }]}>
            {xpMiniGamesHoje}/{limiteXpMiniGameDiario}
          </TextoApp>
          <TextoApp style={[styles.miniLabel, { color: paleta.textoSecundario }]}>XP games hoje</TextoApp>
        </View>
      </View>

      <CartaoPadrao>
        <View style={styles.linhaCartaoTopo}>
          <Ionicons name="compass-outline" size={22} color={paleta.destaqueSecundario} />
          <TextoApp style={[styles.cartaoTitulo, { color: paleta.textoPrincipal }]}>Dica</TextoApp>
        </View>
        <TextoApp style={[styles.textoInfo, { color: paleta.textoSecundario }]}>
          Veja missoes na aba Missoes e personalize o tema em Perfil → Aparência.
        </TextoApp>
      </CartaoPadrao>
    </ScrollView>
  );
}
