import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BotaoPrimario from "../../components/BotaoPrimario";
import coresTema from "../../constants/cores";
import { useDadosApp } from "../../context/DadosAppContext";

export default function TelaJogoTap() {
  const { registrarResultadoMiniGame } = useDadosApp();
  const [segundosRestantes, setSegundosRestantes] = useState(10);
  const [pontuacaoTap, setPontuacaoTap] = useState(0);
  const [jogoIniciado, setJogoIniciado] = useState(false);

  useEffect(() => {
    if (!jogoIniciado || segundosRestantes <= 0) return undefined;
    const intervaloTempo = setInterval(() => setSegundosRestantes((valorAnterior) => valorAnterior - 1), 1000);
    return () => clearInterval(intervaloTempo);
  }, [jogoIniciado, segundosRestantes]);

  useEffect(() => {
    if (jogoIniciado && segundosRestantes === 0) {
      const xpRecebido = registrarResultadoMiniGame("tap", pontuacaoTap);
      Alert.alert("Tempo encerrado", `Pontos: ${pontuacaoTap} | XP ganho: ${xpRecebido}`);
      setJogoIniciado(false);
    }
  }, [jogoIniciado, segundosRestantes, pontuacaoTap, registrarResultadoMiniGame]);

  function iniciarRodada() {
    setPontuacaoTap(0);
    setSegundosRestantes(10);
    setJogoIniciado(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.info}>Tempo: {segundosRestantes}s</Text>
      <Text style={styles.info}>Toques: {pontuacaoTap}</Text>
      <TouchableOpacity style={styles.areaTap} disabled={!jogoIniciado} onPress={() => setPontuacaoTap((valorAnterior) => valorAnterior + 1)}>
        <Text style={styles.textoTap}>TAP</Text>
      </TouchableOpacity>
      <BotaoPrimario tituloBotao={jogoIniciado ? "Jogando..." : "Iniciar rodada"} onPress={iniciarRodada} desabilitado={jogoIniciado} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: coresTema.fundoPrimario, justifyContent: "center", alignItems: "center", padding: 16 },
  info: { fontSize: 18, color: coresTema.textoPrincipal, marginBottom: 8 },
  areaTap: { width: 200, height: 200, borderRadius: 100, backgroundColor: coresTema.destaque, justifyContent: "center", alignItems: "center", marginVertical: 20 },
  textoTap: { color: "#FFF", fontWeight: "800", fontSize: 32 },
});
