import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import BotaoPrimario from "../components/BotaoPrimario";
import CartaoPadrao from "../components/CartaoPadrao";
import TextoApp from "../components/TextoApp";
import FaixasDeCores from "../components/FaixasDeCores";
import rotas from "../constants/rotas";

function iniciais(nome) {
  if (!nome || !nome.trim()) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function criarEstilos(tokens) {
  const { espacamento: e, tipografia: tip } = tokens;
  return StyleSheet.create({
    scroll: { flex: 1 },
    heroWrap: {},
    heroGradient: {
      minHeight: 220,
    },
    heroConteudo: {
      paddingVertical: e.xl,
      paddingHorizontal: e.md,
      alignItems: "center",
    },
    botaoEngrenagem: {
      position: "absolute",
      top: e.sm,
      right: e.sm,
      zIndex: 2,
      padding: e.xs,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: e.sm,
    },
    avatarTexto: {
      fontSize: tip.tituloHero,
      fontWeight: "800",
    },
    nome: {
      fontSize: tip.tituloHero,
      fontWeight: "800",
      textAlign: "center",
    },
    email: {
      fontSize: tip.legenda,
      opacity: 0.9,
      marginTop: 4,
      textAlign: "center",
    },
    linhaStats: {
      flexDirection: "row",
      marginTop: e.lg,
      gap: e.sm,
      justifyContent: "center",
    },
    statPill: {
      backgroundColor: "rgba(255,255,255,0.22)",
      paddingVertical: e.sm,
      paddingHorizontal: e.md,
      alignItems: "center",
      minWidth: 72,
    },
    statValor: { fontSize: tip.corpo, fontWeight: "800" },
    statLabel: { fontSize: 11, marginTop: 2, opacity: 0.95 },
    corpo: {
      paddingHorizontal: e.md,
      marginTop: e.md,
    },
    secaoTitulo: {
      fontWeight: "700",
      fontSize: tip.tituloSecao,
      marginBottom: e.sm,
    },
    linhaLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: e.sm,
      paddingVertical: e.sm,
    },
    linhaLinkTexto: { flex: 1, fontSize: tip.corpo, fontWeight: "600" },
  });
}

export default function TelaPerfil({ navigation }) {
  const { usuarioAutenticado, logout } = useAuth();
  const { expAtual, streakAtual, progressoNivel } = useDadosApp();
  const { paleta, insetsChrome, tokens } = useTemaVisual();
  const styles = useMemo(() => criarEstilos(tokens), [tokens]);

  const nome = usuarioAutenticado?.nomeUsuario || "Aventureiro";
  const email = usuarioAutenticado?.emailUsuario || "";

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{ paddingBottom: insetsChrome.paddingBottomConteudo + tokens.espacamento.lg }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroWrap, { paddingTop: insetsChrome.paddingTopConteudo }]}>
        <View
          style={[
            styles.heroGradient,
            {
              marginHorizontal: tokens.espacamento.md,
              borderRadius: tokens.raio.cartao,
              overflow: "hidden",
            },
          ]}
        >
          {tokens.usarFaixasEmVezDeGradiente ? (
            <FaixasDeCores cores={paleta.headerGradient} style={StyleSheet.absoluteFillObject} />
          ) : (
            <LinearGradient colors={paleta.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
          )}
          <View style={styles.heroConteudo}>
            <Pressable style={styles.botaoEngrenagem} onPress={() => navigation.navigate(rotas.configuracoesAparencia)} hitSlop={12}>
              <Ionicons name="color-palette-outline" size={24} color={paleta.textoSobreGradiente} />
            </Pressable>
            <View style={[styles.avatar, { borderColor: paleta.destaqueSecundario, backgroundColor: paleta.fundoCartao }]}>
              <TextoApp style={[styles.avatarTexto, { color: paleta.destaqueSecundario }]}>{iniciais(nome)}</TextoApp>
            </View>
            <TextoApp style={[styles.nome, { color: paleta.textoSobreGradiente }]}>{nome}</TextoApp>
            {email ? <TextoApp style={[styles.email, { color: paleta.textoSobreGradiente }]}>{email}</TextoApp> : null}
            <View style={styles.linhaStats}>
              <View style={[styles.statPill, { borderRadius: tokens.raio.pill }]}>
                <TextoApp style={[styles.statValor, { color: paleta.textoSobreGradiente }]}>Nv.{progressoNivel.nivelAtual}</TextoApp>
                <TextoApp style={[styles.statLabel, { color: paleta.textoSobreGradiente }]}>Nivel</TextoApp>
              </View>
              <View style={[styles.statPill, { borderRadius: tokens.raio.pill }]}>
                <TextoApp style={[styles.statValor, { color: paleta.textoSobreGradiente }]}>{expAtual}</TextoApp>
                <TextoApp style={[styles.statLabel, { color: paleta.textoSobreGradiente }]}>XP</TextoApp>
              </View>
              <View style={[styles.statPill, { borderRadius: tokens.raio.pill }]}>
                <TextoApp style={[styles.statValor, { color: paleta.textoSobreGradiente }]}>{streakAtual}</TextoApp>
                <TextoApp style={[styles.statLabel, { color: paleta.textoSobreGradiente }]}>Streak</TextoApp>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.corpo}>
        <CartaoPadrao>
          <TextoApp style={[styles.secaoTitulo, { color: paleta.textoPrincipal }]}>Conta</TextoApp>
          <TouchableOpacity style={styles.linhaLink} onPress={() => navigation.navigate(rotas.configuracoesAparencia)}>
            <Ionicons name="brush-outline" size={22} color={paleta.textoSecundario} />
            <TextoApp style={[styles.linhaLinkTexto, { color: paleta.textoPrincipal }]}>Aparência e tema</TextoApp>
            <Ionicons name="chevron-forward" size={20} color={paleta.textoSecundario} />
          </TouchableOpacity>
        </CartaoPadrao>

        <BotaoPrimario tituloBotao="Sair da conta" onPress={logout} />
      </View>
    </ScrollView>
  );
}
