import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useDadosApp } from "../context/DadosAppContext";
import CartaoPadrao from "../components/CartaoPadrao";
import BotaoPrimario from "../components/BotaoPrimario";
import FundoGradienteDecorativo from "../components/FundoGradienteDecorativo";
import coresTema from "../constants/cores";

export default function TelaDashboard() {
  const { usuarioAutenticado, logout } = useAuth();
  const { expAtual, streakAtual, progressoNivel, xpMiniGamesHoje, limiteXpMiniGameDiario } = useDadosApp();

  return (
    <FundoGradienteDecorativo style={styles.fundo}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Dashboard</Text>
        <Text style={styles.subtitulo}>Ola, {usuarioAutenticado?.nomeUsuario || "Aventureiro"}</Text>

        <CartaoPadrao>
          <Text style={styles.cartaoTitulo}>Nivel {progressoNivel.nivelAtual}</Text>
          <Text style={styles.textoInfo}>
            XP: {expAtual} / {progressoNivel.expMaximo}
          </Text>
          <View style={styles.barraFundo}>
            <View style={[styles.barraValor, { width: `${progressoNivel.progressoNivel}%` }]} />
          </View>
        </CartaoPadrao>

        <CartaoPadrao>
          <Text style={styles.cartaoTitulo}>Streak</Text>
          <Text style={styles.textoInfo}>{streakAtual} dias consecutivos</Text>
        </CartaoPadrao>

        <CartaoPadrao>
          <Text style={styles.cartaoTitulo}>XP de mini games hoje</Text>
          <Text style={styles.textoInfo}>
            {xpMiniGamesHoje} / {limiteXpMiniGameDiario}
          </Text>
        </CartaoPadrao>

        <BotaoPrimario tituloBotao="Sair da conta" onPress={logout} />
      </ScrollView>
    </FundoGradienteDecorativo>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: coresTema.fundoPrimario },
  scroll: { flex: 1 },
  container: { padding: 16, flexGrow: 1 },
  titulo: { fontSize: 28, fontWeight: "800", color: coresTema.textoPrincipal },
  subtitulo: { color: coresTema.textoSecundario, marginBottom: 14 },
  cartaoTitulo: { fontWeight: "700", fontSize: 16, marginBottom: 6, color: coresTema.textoPrincipal },
  textoInfo: { color: coresTema.textoSecundario },
  barraFundo: { backgroundColor: "#E8EAF4", height: 10, borderRadius: 999, marginTop: 10, overflow: "hidden" },
  barraValor: { backgroundColor: coresTema.destaque, height: "100%" },
});
