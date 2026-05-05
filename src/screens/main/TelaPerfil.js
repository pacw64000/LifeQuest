import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useDadosApp } from "../context/DadosAppContext";
import { useTemaVisual } from "../context/TemaVisualContext";
import BotaoPrimario from "../components/BotaoPrimario";
import CartaoPadrao from "../components/CartaoPadrao";
import rotas from "../constants/rotas";
import { espacamento, raio, tipografia } from "../constants/layout";

function iniciais(nome) {
  if (!nome || !nome.trim()) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function TelaPerfil({ navigation }) {
  const { usuarioAutenticado, logout } = useAuth();
  const { expAtual, streakAtual, progressoNivel } = useDadosApp();
  const { paleta, insetsChrome } = useTemaVisual();

  const nome = usuarioAutenticado?.nomeUsuario || "Aventureiro";
  const email = usuarioAutenticado?.emailUsuario || "";

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: paleta.fundoPrimario }]}
      contentContainerStyle={{ paddingBottom: insetsChrome.paddingBottomConteudo + espacamento.lg }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroWrap, { paddingTop: insetsChrome.paddingTopConteudo }]}>
        <LinearGradient colors={paleta.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>
          <Pressable style={styles.botaoEngrenagem} onPress={() => navigation.navigate(rotas.configuracoesAparencia)} hitSlop={12}>
            <Ionicons name="color-palette-outline" size={24} color={paleta.textoSobreGradiente} />
          </Pressable>
          <View style={[styles.avatar, { borderColor: paleta.destaqueSecundario, backgroundColor: paleta.fundoCartao }]}>
            <Text style={[styles.avatarTexto, { color: paleta.destaqueSecundario }]}>{iniciais(nome)}</Text>
          </View>
          <Text style={[styles.nome, { color: paleta.textoSobreGradiente }]}>{nome}</Text>
          {email ? <Text style={[styles.email, { color: paleta.textoSobreGradiente }]}>{email}</Text> : null}
          <View style={styles.linhaStats}>
            <View style={styles.statPill}>
              <Text style={[styles.statValor, { color: paleta.textoSobreGradiente }]}>Nv.{progressoNivel.nivelAtual}</Text>
              <Text style={[styles.statLabel, { color: paleta.textoSobreGradiente }]}>Nivel</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={[styles.statValor, { color: paleta.textoSobreGradiente }]}>{expAtual}</Text>
              <Text style={[styles.statLabel, { color: paleta.textoSobreGradiente }]}>XP</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={[styles.statValor, { color: paleta.textoSobreGradiente }]}>{streakAtual}</Text>
              <Text style={[styles.statLabel, { color: paleta.textoSobreGradiente }]}>Streak</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.corpo}>
        <CartaoPadrao>
          <Text style={[styles.secaoTitulo, { color: paleta.textoPrincipal }]}>Conta</Text>
          <TouchableOpacity style={styles.linhaLink} onPress={() => navigation.navigate(rotas.configuracoesAparencia)}>
            <Ionicons name="brush-outline" size={22} color={paleta.textoSecundario} />
            <Text style={[styles.linhaLinkTexto, { color: paleta.textoPrincipal }]}>Aparência e tema</Text>
            <Ionicons name="chevron-forward" size={20} color={paleta.textoSecundario} />
          </TouchableOpacity>
        </CartaoPadrao>

        <BotaoPrimario tituloBotao="Sair da conta" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  heroWrap: {},
  heroGradient: {
    marginHorizontal: espacamento.md,
    borderRadius: raio.cartao,
    paddingVertical: espacamento.xl,
    paddingHorizontal: espacamento.md,
    alignItems: "center",
    minHeight: 220,
  },
  botaoEngrenagem: {
    position: "absolute",
    top: espacamento.sm,
    right: espacamento.sm,
    zIndex: 2,
    padding: espacamento.xs,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espacamento.sm,
  },
  avatarTexto: {
    fontSize: tipografia.tituloHero,
    fontWeight: "800",
  },
  nome: {
    fontSize: tipografia.tituloHero,
    fontWeight: "800",
    textAlign: "center",
  },
  email: {
    fontSize: tipografia.legenda,
    opacity: 0.9,
    marginTop: 4,
    textAlign: "center",
  },
  linhaStats: {
    flexDirection: "row",
    marginTop: espacamento.lg,
    gap: espacamento.sm,
    justifyContent: "center",
  },
  statPill: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingVertical: espacamento.sm,
    paddingHorizontal: espacamento.md,
    borderRadius: raio.pill,
    alignItems: "center",
    minWidth: 72,
  },
  statValor: { fontSize: tipografia.corpo, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, opacity: 0.95 },
  corpo: {
    paddingHorizontal: espacamento.md,
    marginTop: espacamento.md,
  },
  secaoTitulo: {
    fontWeight: "700",
    fontSize: tipografia.tituloSecao,
    marginBottom: espacamento.sm,
  },
  linhaLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacamento.sm,
    paddingVertical: espacamento.sm,
  },
  linhaLinkTexto: { flex: 1, fontSize: tipografia.corpo, fontWeight: "600" },
});
