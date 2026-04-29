import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import CartaoPadrao from "../components/CartaoPadrao";
import { espacamento, tipografia } from "../constants/layout";

export default function TelaDashboard() {
  const { usuarioAutenticado } = useAuth();
  const { expAtual, streakAtual, progressoNivel, xpMiniGamesHoje, limiteXpMiniGameDiario } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

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
      <Text style={[styles.titulo, { color: paleta.textoPrincipal }]}>Inicio</Text>
      <Text style={[styles.subtitulo, { color: paleta.textoSecundario }]}>Ola, {usuarioAutenticado?.nomeUsuario || "Aventureiro"}</Text>
      <Text style={[styles.dica, { color: paleta.textoSecundario }]}>
        Veja seu progresso aqui. Perfil e tema ficam na aba Perfil.
      </Text>

      <CartaoPadrao>
        <Text style={[styles.cartaoTitulo, { color: paleta.textoPrincipal }]}>Nivel {progressoNivel.nivelAtual}</Text>
        <Text style={[styles.textoInfo, { color: paleta.textoSecundario }]}>
          XP: {expAtual} / {progressoNivel.expMaximo}
        </Text>
        <View style={[styles.barraFundo, { backgroundColor: paleta.bordaSuave }]}>
          <View style={[styles.barraValor, { width: `${progressoNivel.progressoNivel}%`, backgroundColor: paleta.destaque }]} />
        </View>
      </CartaoPadrao>

      <CartaoPadrao>
        <Text style={[styles.cartaoTitulo, { color: paleta.textoPrincipal }]}>Streak</Text>
        <Text style={[styles.textoInfo, { color: paleta.textoSecundario }]}>{streakAtual} dias consecutivos</Text>
      </CartaoPadrao>

      <CartaoPadrao>
        <Text style={[styles.cartaoTitulo, { color: paleta.textoPrincipal }]}>XP de mini games hoje</Text>
        <Text style={[styles.textoInfo, { color: paleta.textoSecundario }]}>
          {xpMiniGamesHoje} / {limiteXpMiniGameDiario}
        </Text>
      </CartaoPadrao>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingHorizontal: espacamento.md, flexGrow: 1 },
  titulo: { fontSize: tipografia.tituloHero, fontWeight: "800", marginBottom: 4 },
  subtitulo: { marginBottom: 8 },
  dica: { fontSize: tipografia.legenda, marginBottom: espacamento.md },
  cartaoTitulo: { fontWeight: "700", fontSize: 16, marginBottom: 6 },
  textoInfo: {},
  barraFundo: { height: 10, borderRadius: 999, marginTop: 10, overflow: "hidden" },
  barraValor: { height: "100%" },
});
